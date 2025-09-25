import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Order, OrderStatus } from '../../infra/database/entities/order.entity';
import { OrderItem } from '../../infra/database/entities/order-item.entity';
import { Product } from '../../infra/database/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import type { Producer } from 'kafkajs';
import type { Client as ElasticClient } from '@elastic/elasticsearch';

type OrderItemView = {
  id: string;
  product: Product;
  quantity: number;
  price: string;
};

type OrderView = {
  id: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemView[];
};

type IndexedOrderItemDoc = {
  productId: string;
  quantity: number;
  price: string;
};

type IndexedOrderDoc = {
  id: string;
  status: OrderStatus;
  createdAt: string | Date;
  items: IndexedOrderItemDoc[];
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly ordersRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly itemsRepo: Repository<OrderItem>,
    @Inject('KAFKA_PRODUCER') private readonly producer: Producer,
    @Inject('ELASTIC_CLIENT') private readonly es: ElasticClient,
  ) {}

  private indexEnsured = false;

  async create(dto: CreateOrderDto): Promise<OrderView> {
    return await this.ordersRepo.manager.transaction(async (trx) => {
      const ordersRepo = trx.getRepository(Order);

      const order = ordersRepo.create({ status: dto.status ?? OrderStatus.PENDING });
      const savedOrder = await ordersRepo.save(order);

      const savedItems = await this.validateOrderItemsForCreate(dto, savedOrder, trx);
      savedOrder.items = savedItems;

      const leanItems = savedItems.map((it) => ({
        productId: it.product.id,
        quantity: it.quantity,
        price: it.price,
      }));
      await this.producer.send({
        topic: 'order_created',
        messages: [
          {
            key: savedOrder.id,
            value: JSON.stringify({
              id: savedOrder.id,
              status: savedOrder.status,
              items: leanItems,
            }),
          },
        ],
      });

      await this.indexOrder(savedOrder);
      return this.buildOrderResponse(savedOrder);
    });
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepo.find();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(id: string, dto: UpdateOrderDto): Promise<OrderView> {
    const order = await this.findOne(id);

    if (dto.status) {
      order.status = dto.status;
    }

    if (dto.items) {
      order.items = await this.validateOrderItemsForUpdate(dto, order, this.ordersRepo.manager);
    }

    const saved = await this.ordersRepo.save(order);

    const leanItemsUpd = (saved.items || []).map((it) => ({ productId: it.product.id, quantity: it.quantity, price: it.price }));
    await this.producer.send({
      topic: 'order_updated',
      messages: [{ key: saved.id, value: JSON.stringify({ id: saved.id, status: saved.status, items: leanItemsUpd }) }],
    });

    await this.indexOrder(saved);
    return this.buildOrderResponse(saved);
  }

  async remove(id: string): Promise<void> {
    await this.itemsRepo.delete({ order: { id } as Order });
    await this.ordersRepo.delete(id);
    await this.es.delete({ index: 'orders', id }).catch(() => undefined);
  }

  async search(params: { id?: string; status?: OrderStatus; fromDate?: string; toDate?: string; item?: string }) {
    const must: Array<Record<string, unknown>> = [];
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

    const result = await this.es.search<IndexedOrderDoc>({
      index: 'orders',
      query: { bool: { must } },
    });
    const hits = result.hits?.hits ?? [];
    return hits
      .filter((h) => Boolean(h._source))
      .map((h) => {
        const src = h._source as IndexedOrderDoc;
        const { id: _ignored, ...rest } = src ?? ({} as IndexedOrderDoc);
        return { id: String(h._id), ...rest };
      });
  }

  private async indexOrder(order: Order): Promise<void> {
    await this.ensureIndex();
    const docItems = (order.items || []).map((it) => ({ productId: it.product?.id, quantity: it.quantity, price: it.price }));
    await this.es.index({ index: 'orders', id: order.id, document: { id: order.id, status: order.status, createdAt: order.createdAt, items: docItems } });
  }

  private buildOrderResponse(order: Order): OrderView {
    const items: OrderItemView[] = (order.items || []).map((it) => ({
      id: it.id,
      product: it.product,
      quantity: it.quantity,
      price: it.price,
    }));

    return {
      id: order.id,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items,
    };
  }

  private async validateOrderItemsForCreate(dto: CreateOrderDto, order: Order, trx: EntityManager): Promise<OrderItem[]> {
    const itemsRepo = trx.getRepository(OrderItem);
    const productsRepo = trx.getRepository(Product);
    const itemsToSave: OrderItem[] = [];
    for (const i of dto.items) {
      const product = await productsRepo.findOne({ where: { id: i.productId } });
      if (!product) throw new NotFoundException(`Product not found: ${i.productId}`);
      if (product.stockQty < i.quantity) throw new NotFoundException(`Insufficient stock for product ${product.id}`);
      const item = itemsRepo.create({ order, product, quantity: i.quantity, price: i.price });
      itemsToSave.push(item);
    }
    return itemsRepo.save(itemsToSave);
  }

  private async validateOrderItemsForUpdate(dto: UpdateOrderDto, order: Order, trx: EntityManager): Promise<OrderItem[]> {
    const itemsRepo = trx.getRepository(OrderItem);
    const productsRepo = trx.getRepository(Product);
    const newItems: OrderItem[] = [];
    for (const i of dto.items ?? []) {
      let item: OrderItem | null = null;
      if (i.id) {
        item = await itemsRepo.findOne({ where: { id: i.id } });
      }
      if (!item) {
        item = itemsRepo.create();
      }

      let product: Product | null = item.product ?? null;
      if (i.productId) {
        product = await productsRepo.findOne({ where: { id: i.productId } });
        if (!product) throw new NotFoundException(`Product not found: ${i.productId}`);
      }
      if (!product) throw new NotFoundException('Product is required');

      if (product.stockQty < i.quantity) {
        throw new NotFoundException(`Insufficient stock for product ${product.id}`);
      }

      item.order = order;
      item.product = product;
      item.quantity = i.quantity;
      item.price = i.price;
      newItems.push(item);
    }

    await itemsRepo.delete({ order: { id: order.id } as Order });
    return itemsRepo.save(newItems);
  }


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


