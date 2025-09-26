import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from '../../infra/database/entities/order.entity';
import { OrderItem } from '../../infra/database/entities/order-item.entity';
import { Product } from '../../infra/database/entities/product.entity';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: jest.Mocked<OrdersService>;

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
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const expectedResponse = {
        id: mockOrder.id,
        status: mockOrder.status,
        createdAt: mockOrder.createdAt,
        updatedAt: mockOrder.updatedAt,
        items: [
          {
            id: mockOrderItem.id,
            product: mockProduct,
            quantity: mockOrderItem.quantity,
            price: mockOrderItem.price,
          },
        ],
      };

      service.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(mockCreateOrderDto);

      expect(service.create).toHaveBeenCalledWith(mockCreateOrderDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when service fails', async () => {
      const error = new NotFoundException('Product not found');
      service.create.mockRejectedValue(error);

      await expect(controller.create(mockCreateOrderDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.create).toHaveBeenCalledWith(mockCreateOrderDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return all orders when no filters provided', async () => {
      const orders = [mockOrder];
      service.findAll.mockResolvedValue(orders);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith({});
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(orders);
    });

    it('should return filtered orders when filters provided', async () => {
      const orders = [mockOrder];
      const filters = {
        id: mockOrder.id,
        status: OrderStatus.PENDING,
        fromDate: '2025-01-01',
        toDate: '2025-01-31',
        item: mockProduct.id,
      };

      service.findAll.mockResolvedValue(orders);

      const result = await controller.findAll(
        filters.id,
        filters.status,
        filters.fromDate,
        filters.toDate,
        filters.item,
      );

      expect(service.findAll).toHaveBeenCalledWith(filters);
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(orders);
    });

    it('should return empty array when no orders found', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith({});
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should handle partial filters', async () => {
      const orders = [mockOrder];
      service.findAll.mockResolvedValue(orders);

      const result = await controller.findAll(
        undefined,
        OrderStatus.PENDING,
        undefined,
        undefined,
        undefined,
      );

      expect(service.findAll).toHaveBeenCalledWith({
        id: undefined,
        status: OrderStatus.PENDING,
        fromDate: undefined,
        toDate: undefined,
        item: undefined,
      });
      expect(result).toEqual(orders);
    });
  });

  describe('findOne', () => {
    it('should return order when found', async () => {
      const orderId = mockOrder.id;
      service.findOne.mockResolvedValue(mockOrder);

      const result = await controller.findOne(orderId);

      expect(service.findOne).toHaveBeenCalledWith(orderId);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException when order not found', async () => {
      const orderId = 'non-existent-id';
      const error = new NotFoundException('Order not found');
      service.findOne.mockRejectedValue(error);

      await expect(controller.findOne(orderId)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findOne).toHaveBeenCalledWith(orderId);
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update order successfully', async () => {
      const orderId = mockOrder.id;
      const updatedOrder = {
        id: mockOrder.id,
        status: OrderStatus.PROCESSING,
        createdAt: mockOrder.createdAt,
        updatedAt: new Date(),
        items: [
          {
            id: mockOrderItem.id,
            product: mockProduct,
            quantity: 3,
            price: '299.97',
          },
        ],
      };

      service.update.mockResolvedValue(updatedOrder);

      const result = await controller.update(orderId, mockUpdateOrderDto);

      expect(service.update).toHaveBeenCalledWith(orderId, mockUpdateOrderDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedOrder);
    });

    it('should throw error when order not found', async () => {
      const orderId = 'non-existent-id';
      const error = new NotFoundException('Order not found');
      service.update.mockRejectedValue(error);

      await expect(
        controller.update(orderId, mockUpdateOrderDto),
      ).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(orderId, mockUpdateOrderDto);
      expect(service.update).toHaveBeenCalledTimes(1);
    });

    it('should update only status', async () => {
      const orderId = mockOrder.id;
      const statusOnlyDto = { status: OrderStatus.SHIPPED };
      const updatedOrder = {
        ...mockOrder,
        status: OrderStatus.SHIPPED,
      };

      service.update.mockResolvedValue(updatedOrder);

      const result = await controller.update(orderId, statusOnlyDto);

      expect(service.update).toHaveBeenCalledWith(orderId, statusOnlyDto);
      expect(result).toEqual(updatedOrder);
    });

    it('should update only items', async () => {
      const orderId = mockOrder.id;
      const itemsOnlyDto = { items: mockUpdateOrderDto.items };
      const updatedOrder = {
        ...mockOrder,
        items: [
          {
            ...mockOrderItem,
            quantity: 3,
            price: '299.97',
          },
        ],
      };

      service.update.mockResolvedValue(updatedOrder);

      const result = await controller.update(orderId, itemsOnlyDto);

      expect(service.update).toHaveBeenCalledWith(orderId, itemsOnlyDto);
      expect(result).toEqual(updatedOrder);
    });
  });

  describe('remove', () => {
    it('should remove order successfully', async () => {
      const orderId = mockOrder.id;
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(orderId);

      expect(service.remove).toHaveBeenCalledWith(orderId);
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException when order not found', async () => {
      const orderId = 'non-existent-id';
      const error = new NotFoundException('Order not found');
      service.remove.mockRejectedValue(error);

      await expect(controller.remove(orderId)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.remove).toHaveBeenCalledWith(orderId);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete CRUD flow', async () => {
      const createResponse = {
        id: mockOrder.id,
        status: mockOrder.status,
        createdAt: mockOrder.createdAt,
        updatedAt: mockOrder.updatedAt,
        items: [
          {
            id: mockOrderItem.id,
            product: mockProduct,
            quantity: mockOrderItem.quantity,
            price: mockOrderItem.price,
          },
        ],
      };

      const updateResponse = {
        ...createResponse,
        status: OrderStatus.PROCESSING,
      };

      service.create.mockResolvedValue(createResponse);
      service.findAll.mockResolvedValue([mockOrder]);
      service.findOne.mockResolvedValue(mockOrder);
      service.update.mockResolvedValue(updateResponse);
      service.remove.mockResolvedValue(undefined);

      const created = await controller.create(mockCreateOrderDto);
      const all = await controller.findAll();
      const one = await controller.findOne(mockOrder.id);
      const updated = await controller.update(mockOrder.id, mockUpdateOrderDto);
      await controller.remove(mockOrder.id);

      expect(service.create).toHaveBeenCalledWith(mockCreateOrderDto);
      expect(service.findAll).toHaveBeenCalledWith({});
      expect(service.findOne).toHaveBeenCalledWith(mockOrder.id);
      expect(service.update).toHaveBeenCalledWith(
        mockOrder.id,
        mockUpdateOrderDto,
      );
      expect(service.remove).toHaveBeenCalledWith(mockOrder.id);

      expect(created).toEqual(createResponse);
      expect(all).toEqual([mockOrder]);
      expect(one).toEqual(mockOrder);
      expect(updated).toEqual(updateResponse);
    });
  });
});
