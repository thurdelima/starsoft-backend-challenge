import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from '../../infra/database/entities/order.entity';
import { OrderItem } from '../../infra/database/entities/order-item.entity';
import { Product } from '../../infra/database/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import type { Producer } from 'kafkajs';
import type { Client as ElasticClient } from '@elastic/elasticsearch';

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepo: jest.Mocked<Repository<Order>>;
  let itemsRepo: jest.Mocked<Repository<OrderItem>>;
  let productsRepo: jest.Mocked<Repository<Product>>;
  let producer: jest.Mocked<Producer>;
  let es: jest.Mocked<ElasticClient>;
  let entityManager: jest.Mocked<EntityManager>;

  const mockProduct: Product = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Product',
    price: '99.99',
    stockQty: 10,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
  };

  const mockOrderItem: OrderItem = {
    id: 'item-123',
    order: {} as Order,
    product: mockProduct,
    quantity: 2,
    price: '199.98',
  };

  const mockOrder: Order = {
    id: 'order-123',
    status: OrderStatus.PENDING,
    deleted: false,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    items: [mockOrderItem],
  };

  const mockCreateOrderDto: CreateOrderDto = {
    status: OrderStatus.PENDING,
    items: [
      {
        productId: mockProduct.id,
        quantity: 2,
        price: '199.98',
      },
    ],
  };

  const mockUpdateOrderDto: UpdateOrderDto = {
    status: OrderStatus.PROCESSING,
    items: [
      {
        productId: mockProduct.id,
        quantity: 3,
        price: '299.97',
      },
    ],
  };

  beforeEach(async () => {
    const mockOrdersRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      manager: {
        transaction: jest.fn(),
        getRepository: jest.fn(),
      },
    };

    const mockItemsRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const mockProductsRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockProducer = {
      send: jest.fn(),
    };

    const mockEs = {
      search: jest.fn(),
      index: jest.fn(),
      indices: {
        exists: jest.fn(),
        create: jest.fn(),
      },
    };

    const mockEntityManager = {
      getRepository: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrdersRepo,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockItemsRepo,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductsRepo,
        },
        {
          provide: 'KAFKA_PRODUCER',
          useValue: mockProducer,
        },
        {
          provide: 'ELASTIC_CLIENT',
          useValue: mockEs,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    ordersRepo = module.get(getRepositoryToken(Order));
    itemsRepo = module.get(getRepositoryToken(OrderItem));
    productsRepo = module.get(getRepositoryToken(Product));
    producer = module.get('KAFKA_PRODUCER');
    es = module.get('ELASTIC_CLIENT');
    entityManager = ordersRepo.manager as jest.Mocked<EntityManager>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new order successfully', async () => {
      // Arrange
      const createdOrder = { ...mockOrder };
      const savedItems = [mockOrderItem];

      const mockTrxOrdersRepo = {
        create: jest.fn().mockReturnValue(createdOrder),
        save: jest.fn().mockResolvedValue(createdOrder),
      };

      const mockTrxProductsRepo = {
        findOne: jest.fn().mockResolvedValue(mockProduct),
        save: jest.fn().mockResolvedValue(mockProduct),
      };

      const mockTrxItemsRepo = {
        create: jest.fn().mockReturnValue(mockOrderItem),
        save: jest.fn().mockResolvedValue(savedItems),
      };

      const transactionMock = jest.fn().mockImplementation(async (callback) => {
        const trx = {
          getRepository: jest.fn().mockImplementation((entity) => {
            if (entity === Order) return mockTrxOrdersRepo;
            if (entity === Product) return mockTrxProductsRepo;
            if (entity === OrderItem) return mockTrxItemsRepo;
            return {};
          }),
        };
        return callback(trx);
      });

      entityManager.transaction = transactionMock;
      producer.send.mockResolvedValue([]);
      es.index.mockResolvedValue({} as any);

      // Act
      const result = await service.create(mockCreateOrderDto);

      // Assert
      expect(entityManager.transaction).toHaveBeenCalled();
      expect(mockTrxProductsRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
      });
      expect(mockTrxProductsRepo.save).toHaveBeenCalled();
      expect(mockTrxItemsRepo.create).toHaveBeenCalled();
      expect(mockTrxItemsRepo.save).toHaveBeenCalled();
      expect(producer.send).toHaveBeenCalledWith({
        topic: 'order_created',
        messages: [
          {
            key: createdOrder.id,
            value: JSON.stringify({
              id: createdOrder.id,
              status: createdOrder.status,
              items: [
                {
                  productId: mockProduct.id,
                  quantity: 2,
                  price: '199.98',
                },
              ],
            }),
          },
        ],
      });
      expect(es.index).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when product not found', async () => {
      // Arrange
      const mockTrxOrdersRepo = {
        create: jest.fn().mockReturnValue(mockOrder),
        save: jest.fn().mockResolvedValue(mockOrder),
      };

      const mockTrxProductsRepo = {
        findOne: jest.fn().mockResolvedValue(null),
        save: jest.fn(),
      };

      const transactionMock = jest.fn().mockImplementation(async (callback) => {
        const trx = {
          getRepository: jest.fn().mockImplementation((entity) => {
            if (entity === Order) return mockTrxOrdersRepo;
            if (entity === Product) return mockTrxProductsRepo;
            return {};
          }),
        };
        return callback(trx);
      });

      entityManager.transaction = transactionMock;

      // Act & Assert
      await expect(service.create(mockCreateOrderDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(mockCreateOrderDto)).rejects.toThrow(
        `Product not found: ${mockProduct.id}`,
      );
    });

    it('should throw NotFoundException when insufficient stock', async () => {
      // Arrange
      const lowStockProduct = { ...mockProduct, stockQty: 1 };

      const mockTrxOrdersRepo = {
        create: jest.fn().mockReturnValue(mockOrder),
        save: jest.fn().mockResolvedValue(mockOrder),
      };

      const mockTrxProductsRepo = {
        findOne: jest.fn().mockResolvedValue(lowStockProduct),
        save: jest.fn(),
      };

      const transactionMock = jest.fn().mockImplementation(async (callback) => {
        const trx = {
          getRepository: jest.fn().mockImplementation((entity) => {
            if (entity === Order) return mockTrxOrdersRepo;
            if (entity === Product) return mockTrxProductsRepo;
            return {};
          }),
        };
        return callback(trx);
      });

      entityManager.transaction = transactionMock;

      // Act & Assert
      await expect(service.create(mockCreateOrderDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(mockCreateOrderDto)).rejects.toThrow(
        'Insufficient stock',
      );
    });
  });

  describe('findAll', () => {
    it('should return all non-deleted orders when no filters provided', async () => {
      // Arrange
      const orders = [mockOrder];
      ordersRepo.find.mockResolvedValue(orders);

      // Act
      const result = await service.findAll();

      // Assert
      expect(ordersRepo.find).toHaveBeenCalledWith({
        where: { deleted: false },
        relations: ['items', 'items.product'],
      });
      expect(result).toEqual(orders);
    });

    it('should return all non-deleted orders when empty filters provided', async () => {
      // Arrange
      const orders = [mockOrder];
      ordersRepo.find.mockResolvedValue(orders);

      // Act
      const result = await service.findAll({});

      // Assert
      expect(ordersRepo.find).toHaveBeenCalledWith({
        where: { deleted: false },
        relations: ['items', 'items.product'],
      });
      expect(result).toEqual(orders);
    });

    it('should use Elasticsearch when filters are provided', async () => {
      // Arrange
      const filters = { status: OrderStatus.PENDING };
      const mockSearchResult = {
        took: 1,
        timed_out: false,
        _shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
        hits: {
          total: { value: 1, relation: 'eq' as any },
          max_score: 1.0,
          hits: [
            {
              _index: 'orders',
              _id: mockOrder.id,
              _score: 1.0,
              _source: {
                id: mockOrder.id,
                status: mockOrder.status,
                createdAt: mockOrder.createdAt,
                updatedAt: mockOrder.updatedAt,
                deleted: false,
                items: [
                  {
                    id: mockOrderItem.id,
                    productId: mockProduct.id,
                    productName: mockProduct.name,
                    productPrice: mockProduct.price,
                    quantity: 2,
                    price: '199.98',
                  },
                ],
              },
            },
          ],
        },
      };

      es.search.mockResolvedValue(mockSearchResult as any);

      // Act
      const result = await service.findAll(filters);

      // Assert
      expect(es.search).toHaveBeenCalledWith({
        index: 'orders',
        query: {
          bool: {
            must: [
              { term: { deleted: false } },
              { term: { status: OrderStatus.PENDING } },
            ],
          },
        },
      });
      expect(ordersRepo.find).not.toHaveBeenCalled(); // Não deve chamar o banco
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockOrder.id);
      expect(result[0].status).toBe(OrderStatus.PENDING);
      expect(result[0].items).toHaveLength(1);
      expect(result[0].items[0].product.name).toBe(mockProduct.name);
    });
  });

  describe('findOne', () => {
    it('should return order when found', async () => {
      // Arrange
      const orderId = mockOrder.id;
      ordersRepo.findOne.mockResolvedValue(mockOrder);

      // Act
      const result = await service.findOne(orderId);

      // Assert
      expect(ordersRepo.findOne).toHaveBeenCalledWith({
        where: { id: orderId, deleted: false },
        relations: ['items', 'items.product'],
      });
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException when order not found', async () => {
      // Arrange
      const orderId = 'non-existent-id';
      ordersRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(orderId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(orderId)).rejects.toThrow('Order not found');
    });
  });

  describe('update', () => {
    it('should update order status', async () => {
      // Arrange
      const orderId = mockOrder.id;
      const updatedOrder = { ...mockOrder, status: OrderStatus.PROCESSING };
      const updateDto = { status: OrderStatus.PROCESSING };

      ordersRepo.findOne.mockResolvedValue(mockOrder);
      ordersRepo.save.mockResolvedValue(updatedOrder);
      producer.send.mockResolvedValue([]);
      es.index.mockResolvedValue({} as any);

      // Act
      const result = await service.update(orderId, updateDto);

      // Assert
      expect(ordersRepo.save).toHaveBeenCalledWith(updatedOrder);
      expect(producer.send).toHaveBeenCalledWith({
        topic: 'order_updated',
        messages: [
          {
            key: updatedOrder.id,
            value: JSON.stringify({
              id: updatedOrder.id,
              status: updatedOrder.status,
              items: [
                {
                  productId: mockProduct.id,
                  quantity: 2,
                  price: '199.98',
                },
              ],
            }),
          },
        ],
      });
      expect(es.index).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should update order items', async () => {
      // Arrange
      const orderId = mockOrder.id;
      const updatedOrder = { ...mockOrder, items: [mockOrderItem] };
      const updateDto = { items: mockUpdateOrderDto.items };

      ordersRepo.findOne.mockResolvedValue(mockOrder);
      ordersRepo.save.mockResolvedValue(updatedOrder);
      producer.send.mockResolvedValue([]);
      es.index.mockResolvedValue({} as any);

      // Mock the manager.getRepository calls in validateOrderItemsForUpdate
      const mockManagerRepo = {
        find: jest.fn().mockResolvedValue([mockOrderItem]),
        findOne: jest.fn().mockResolvedValue(mockProduct),
        save: jest.fn().mockResolvedValue(mockProduct),
        delete: jest.fn().mockResolvedValue({ affected: 1 } as any),
        create: jest.fn().mockReturnValue(mockOrderItem),
      };

      ordersRepo.manager.getRepository = jest
        .fn()
        .mockReturnValue(mockManagerRepo);

      // Act
      const result = await service.update(orderId, updateDto);

      // Assert
      expect(mockManagerRepo.find).toHaveBeenCalled();
      expect(mockManagerRepo.save).toHaveBeenCalledTimes(3); // Restore + debit + save new items
      expect(mockManagerRepo.delete).toHaveBeenCalled();
      expect(mockManagerRepo.create).toHaveBeenCalled();
      expect(ordersRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should perform soft delete', async () => {
      // Arrange
      const orderId = mockOrder.id;
      const orderWithItems = { ...mockOrder, items: [mockOrderItem] };
      const deletedOrder = { ...orderWithItems, deleted: true };

      ordersRepo.findOne.mockResolvedValue(orderWithItems);
      ordersRepo.save.mockResolvedValue(deletedOrder);
      es.index.mockResolvedValue({});
      (es.indices.exists as jest.Mock).mockResolvedValue(true);

      // Act
      await service.remove(orderId);

      // Assert
      expect(ordersRepo.findOne).toHaveBeenCalledWith({
        where: { id: orderId, deleted: false },
        relations: ['items', 'items.product'],
      });
      expect(ordersRepo.save).toHaveBeenCalledWith(deletedOrder);
      expect(es.index).toHaveBeenCalled();
    });
  });
});
