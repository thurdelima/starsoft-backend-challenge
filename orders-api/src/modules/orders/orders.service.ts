import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../../infra/database/entities/order.entity';
import { OrderItem } from '../../infra/database/entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import type { Producer } from 'kafkajs';
import type { Client as ElasticClient } from '@elastic/elasticsearch';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly ordersRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly itemsRepo: Repository<OrderItem>,
    @Inject('KAFKA_PRODUCER') private readonly producer: Producer,
    @Inject('ELASTIC_CLIENT') private readonly es: ElasticClient,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = this.ordersRepo.create({
      status: dto.status ?? OrderStatus.PENDING,
      items: dto.items.map((i) => this.itemsRepo.create({ productId: i.productId, quantity: i.quantity, price: i.price })),
    });
    const saved = await this.ordersRepo.save(order);

    await this.producer.send({
      topic: 'order_created',
      messages: [{ key: saved.id, value: JSON.stringify({ id: saved.id, status: saved.status, items: saved.items }) }],
    });

    await this.indexOrder(saved);
    return saved;
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepo.find();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);
    order.status = dto.status;
    const saved = await this.ordersRepo.save(order);

    await this.producer.send({
      topic: 'order_status_updated',
      messages: [{ key: saved.id, value: JSON.stringify({ id: saved.id, status: saved.status }) }],
    });

    await this.indexOrder(saved);
    return saved;
  }

  async remove(id: string): Promise<void> {
    await this.itemsRepo.delete({ order: { id } as Order });
    await this.ordersRepo.delete(id);
    await this.es.delete({ index: 'orders', id }).catch(() => undefined);
  }

  async search(params: { id?: string; status?: OrderStatus; fromDate?: string; toDate?: string; item?: string }) {
    const must: any[] = [];
    if (params.id) must.push({ term: { id: params.id } });
    if (params.status) must.push({ term: { status: params.status } });
    if (params.fromDate || params.toDate) {
      must.push({
        range: {
          createdAt: {
            gte: params.fromDate,
            lte: params.toDate,
          },
        },
      });
    }
    if (params.item) {
      must.push({ nested: { path: 'items', query: { bool: { must: [{ match: { 'items.productId': params.item } }] } } } });
    }

    const result = await this.es.search({
      index: 'orders',
      query: { bool: { must } },
    });
    return result.hits.hits.map((h: any) => ({ id: h._id, ...h._source }));
  }

  private async indexOrder(order: Order): Promise<void> {
    await this.ensureIndex();
    await this.es.index({ index: 'orders', id: order.id, document: { id: order.id, status: order.status, createdAt: order.createdAt, items: order.items } });
  }

  private indexEnsured = false;
  private async ensureIndex() {
    if (this.indexEnsured) return;
    const exists = await this.es.indices.exists({ index: 'orders' });
    if (!exists) {
      await this.es.indices.create({
        index: 'orders',
        mappings: {
          properties: {
            id: { type: 'keyword' },
            status: { type: 'keyword' },
            createdAt: { type: 'date' },
            items: {
              type: 'nested',
              properties: {
                productId: { type: 'keyword' },
                quantity: { type: 'integer' },
                price: { type: 'scaled_float', scaling_factor: 100 },
              },
            },
          },
        },
      });
    }
    this.indexEnsured = true;
  }
}


