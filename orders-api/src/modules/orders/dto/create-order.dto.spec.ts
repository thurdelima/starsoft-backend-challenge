import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateOrderDto, CreateOrderItemDto } from './create-order.dto';
import { OrderStatus } from '../../../infra/database/entities/order.entity';

describe('CreateOrderDto', () => {
  describe('CreateOrderItemDto', () => {
    let dto: CreateOrderItemDto;

    beforeEach(() => {
      dto = new CreateOrderItemDto();
    });

    it('should be defined', () => {
      expect(dto).toBeDefined();
    });

    describe('productId validation', () => {
      it('should fail validation with invalid UUID format', async () => {
        dto.productId = 'prod-001';
        dto.quantity = 2;
        dto.price = '29.99';

        const errors = await validate(dto);
        const productIdErrors = errors.filter(
          (error) => error.property === 'productId',
        );
        expect(productIdErrors).toHaveLength(1);
        expect(productIdErrors[0].constraints?.isUuid).toBeDefined();
      });

      it('should fail validation with empty productId', async () => {
        dto.productId = '';
        dto.quantity = 2;
        dto.price = '29.99';

        const errors = await validate(dto);
        const productIdErrors = errors.filter(
          (error) => error.property === 'productId',
        );
        expect(productIdErrors).toHaveLength(1);
        expect(productIdErrors[0].constraints?.isNotEmpty).toBeDefined();
        expect(productIdErrors[0].constraints?.isUuid).toBeDefined();
      });

      it('should fail validation with non-string productId', async () => {
        (dto as any).productId = 123;
        dto.quantity = 2;
        dto.price = '29.99';

        const errors = await validate(dto);
        const productIdErrors = errors.filter(
          (error) => error.property === 'productId',
        );
        expect(productIdErrors).toHaveLength(1);
        expect(productIdErrors[0].constraints?.isUuid).toBeDefined();
      });

      it('should fail validation with UUID v1 format', async () => {
        dto.productId = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
        dto.quantity = 2;
        dto.price = '29.99';

        const errors = await validate(dto);
        const productIdErrors = errors.filter(
          (error) => error.property === 'productId',
        );
        expect(productIdErrors).toHaveLength(1);
        expect(productIdErrors[0].constraints?.isUuid).toBeDefined();
      });
    });

    describe('quantity validation', () => {
      it('should fail validation with zero quantity', async () => {
        dto.productId = '11111111-1111-1111-1111-111111111111';
        dto.quantity = 0;
        dto.price = '29.99';

        const errors = await validate(dto);
        const quantityErrors = errors.filter(
          (error) => error.property === 'quantity',
        );
        expect(quantityErrors).toHaveLength(1);
        expect(quantityErrors[0].constraints?.isPositive).toBeDefined();
      });

      it('should fail validation with negative quantity', async () => {
        dto.productId = '11111111-1111-1111-1111-111111111111';
        dto.quantity = -1;
        dto.price = '29.99';

        const errors = await validate(dto);
        const quantityErrors = errors.filter(
          (error) => error.property === 'quantity',
        );
        expect(quantityErrors).toHaveLength(1);
        expect(quantityErrors[0].constraints?.isPositive).toBeDefined();
      });

      it('should fail validation with non-number quantity', async () => {
        dto.productId = '11111111-1111-1111-1111-111111111111';
        (dto as any).quantity = '2';
        dto.price = '29.99';

        const errors = await validate(dto);
        const quantityErrors = errors.filter(
          (error) => error.property === 'quantity',
        );
        expect(quantityErrors).toHaveLength(1);
        expect(quantityErrors[0].constraints?.isNumber).toBeDefined();
      });
    });

    describe('price validation', () => {
      it('should fail validation with non-string price', async () => {
        dto.productId = '11111111-1111-1111-1111-111111111111';
        dto.quantity = 2;
        (dto as any).price = 29.99;

        const errors = await validate(dto);
        const priceErrors = errors.filter(
          (error) => error.property === 'price',
        );
        expect(priceErrors).toHaveLength(1);
        expect(priceErrors[0].constraints?.isString).toBeDefined();
      });
    });

    describe('integration', () => {
      it('should fail validation with multiple invalid fields', async () => {
        dto.productId = 'invalid-uuid';
        dto.quantity = -1;
        dto.price = '';

        const errors = await validate(dto);
        expect(errors).toHaveLength(2);

        const productIdErrors = errors.filter(
          (error) => error.property === 'productId',
        );
        const quantityErrors = errors.filter(
          (error) => error.property === 'quantity',
        );

        expect(productIdErrors).toHaveLength(1);
        expect(quantityErrors).toHaveLength(1);
      });
    });
  });

  describe('CreateOrderDto', () => {
    let dto: CreateOrderDto;

    beforeEach(() => {
      dto = new CreateOrderDto();
    });

    it('should be defined', () => {
      expect(dto).toBeDefined();
    });

    describe('status validation', () => {
      it('should pass validation with valid status', async () => {
        dto.status = OrderStatus.PENDING;
        dto.items = [
          {
            productId: '11111111-1111-1111-1111-111111111111',
            quantity: 2,
            price: '29.99',
          },
        ];

        const errors = await validate(dto);
        const statusErrors = errors.filter(
          (error) => error.property === 'status',
        );
        expect(statusErrors).toHaveLength(0);
      });

      it('should pass validation with all valid statuses', async () => {
        const validStatuses = [
          OrderStatus.PENDING,
          OrderStatus.PROCESSING,
          OrderStatus.SHIPPED,
          OrderStatus.DELIVERED,
          OrderStatus.CANCELED,
        ];

        for (const status of validStatuses) {
          dto.status = status;
          dto.items = [
            {
              productId: '11111111-1111-1111-1111-111111111111',
              quantity: 2,
              price: '29.99',
            },
          ];

          const errors = await validate(dto);
          const statusErrors = errors.filter(
            (error) => error.property === 'status',
          );
          expect(statusErrors).toHaveLength(0);
        }
      });

      it('should pass validation with undefined status', async () => {
        dto.status = undefined;
        dto.items = [
          {
            productId: '11111111-1111-1111-1111-111111111111',
            quantity: 2,
            price: '29.99',
          },
        ];

        const errors = await validate(dto);
        const statusErrors = errors.filter(
          (error) => error.property === 'status',
        );
        expect(statusErrors).toHaveLength(0);
      });

      it('should fail validation with invalid status', async () => {
        (dto as any).status = 'INVALID_STATUS';
        dto.items = [
          {
            productId: '11111111-1111-1111-1111-111111111111',
            quantity: 2,
            price: '29.99',
          },
        ];

        const errors = await validate(dto);
        const statusErrors = errors.filter(
          (error) => error.property === 'status',
        );
        expect(statusErrors).toHaveLength(1);
        expect(statusErrors[0].constraints?.isEnum).toBeDefined();
      });
    });

    describe('items validation', () => {
      it('should fail validation with non-array items', async () => {
        (dto as any).items = 'not-an-array';

        const errors = await validate(dto);
        const itemsErrors = errors.filter(
          (error) => error.property === 'items',
        );
        expect(itemsErrors).toHaveLength(1);
        expect(itemsErrors[0].constraints?.isArray).toBeDefined();
      });

      it('should fail validation with items containing invalid data', async () => {
        dto.items = [
          {
            productId: 'invalid-uuid',
            quantity: -1,
            price: '',
          },
        ];

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);

        const nestedErrors = errors.filter(
          (error) => error.property === 'items',
        );
        expect(nestedErrors).toHaveLength(1);
        expect(nestedErrors[0].children).toBeDefined();
        expect(nestedErrors[0].children?.length).toBeGreaterThan(0);
      });
    });

    describe('integration', () => {
      it('should fail validation with multiple invalid fields', async () => {
        (dto as any).status = 'INVALID';
        dto.items = [];

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('class-transformer integration', () => {
    it('should transform plain object to CreateOrderDto', () => {
      const plainObject = {
        status: 'PENDING',
        items: [
          {
            productId: '11111111-1111-1111-1111-111111111111',
            quantity: 2,
            price: '29.99',
          },
        ],
      };

      const transformedDto = plainToClass(CreateOrderDto, plainObject);

      expect(transformedDto).toBeInstanceOf(CreateOrderDto);
      expect(transformedDto.status).toBe(OrderStatus.PENDING);
      expect(transformedDto.items).toHaveLength(1);
      expect(transformedDto.items[0]).toBeInstanceOf(CreateOrderItemDto);
    });

    it('should transform items array correctly', () => {
      const plainObject = {
        items: [
          {
            productId: '11111111-1111-1111-1111-111111111111',
            quantity: 2,
            price: '29.99',
          },
          {
            productId: '22222222-2222-2222-2222-222222222222',
            quantity: 1,
            price: '15.50',
          },
        ],
      };

      const transformedDto = plainToClass(CreateOrderDto, plainObject);

      expect(transformedDto.items).toHaveLength(2);
      transformedDto.items.forEach((item) => {
        expect(item).toBeInstanceOf(CreateOrderItemDto);
      });
    });

    it('should handle undefined status in transformation', () => {
      const plainObject = {
        items: [
          {
            productId: '11111111-1111-1111-1111-111111111111',
            quantity: 2,
            price: '29.99',
          },
        ],
      };

      const transformedDto = plainToClass(CreateOrderDto, plainObject);

      expect(transformedDto.status).toBeUndefined();
      expect(transformedDto.items).toHaveLength(1);
    });
  });

  describe('property assignment', () => {
    it('should allow property assignment for CreateOrderItemDto', () => {
      const itemDto = new CreateOrderItemDto();
      itemDto.productId = '11111111-1111-1111-1111-111111111111';
      itemDto.quantity = 2;
      itemDto.price = '29.99';

      expect(itemDto.productId).toBe('11111111-1111-1111-1111-111111111111');
      expect(itemDto.quantity).toBe(2);
      expect(itemDto.price).toBe('29.99');
    });

    it('should allow property assignment for CreateOrderDto', () => {
      const orderDto = new CreateOrderDto();
      orderDto.status = OrderStatus.PROCESSING;
      orderDto.items = [
        {
          productId: '11111111-1111-1111-1111-111111111111',
          quantity: 2,
          price: '29.99',
        },
      ];

      expect(orderDto.status).toBe(OrderStatus.PROCESSING);
      expect(orderDto.items).toHaveLength(1);
      expect(orderDto.items[0].productId).toBe(
        '11111111-1111-1111-1111-111111111111',
      );
    });

    it('should allow modification of properties', () => {
      const orderDto = new CreateOrderDto();
      orderDto.status = OrderStatus.PENDING;
      orderDto.items = [
        {
          productId: '11111111-1111-1111-1111-111111111111',
          quantity: 2,
          price: '29.99',
        },
      ];

      orderDto.status = OrderStatus.PROCESSING;
      orderDto.items[0].quantity = 3;

      expect(orderDto.status).toBe(OrderStatus.PROCESSING);
      expect(orderDto.items[0].quantity).toBe(3);
    });
  });

  describe('DTO structure', () => {
    it('should have correct property types', () => {
      const itemDto = new CreateOrderItemDto();
      const orderDto = new CreateOrderDto();

      expect(typeof itemDto.productId).toBe('undefined');
      expect(typeof itemDto.quantity).toBe('undefined');
      expect(typeof itemDto.price).toBe('undefined');

      expect(typeof orderDto.status).toBe('undefined');
      expect(Array.isArray(orderDto.items)).toBe(false);
    });

    it('should allow setting properties with correct types', () => {
      const itemDto = new CreateOrderItemDto();
      itemDto.productId = '11111111-1111-1111-1111-111111111111';
      itemDto.quantity = 2;
      itemDto.price = '29.99';

      expect(typeof itemDto.productId).toBe('string');
      expect(typeof itemDto.quantity).toBe('number');
      expect(typeof itemDto.price).toBe('string');
    });

    it('should handle array operations', () => {
      const orderDto = new CreateOrderDto();
      orderDto.items = [
        {
          productId: '11111111-1111-1111-1111-111111111111',
          quantity: 2,
          price: '29.99',
        },
      ];

      expect(Array.isArray(orderDto.items)).toBe(true);
      expect(orderDto.items).toHaveLength(1);
      expect(orderDto.items[0]).toHaveProperty('productId');
      expect(orderDto.items[0]).toHaveProperty('quantity');
      expect(orderDto.items[0]).toHaveProperty('price');
    });
  });

  describe('validation constraints', () => {
    it('should validate UUID format correctly', async () => {
      const itemDto = new CreateOrderItemDto();
      itemDto.productId = 'not-a-uuid';
      itemDto.quantity = 1;
      itemDto.price = '10.00';

      const errors = await validate(itemDto);
      const productIdErrors = errors.filter(
        (error) => error.property === 'productId',
      );
      expect(productIdErrors).toHaveLength(1);
      expect(productIdErrors[0].constraints?.isUuid).toBeDefined();
    });

    it('should validate positive numbers correctly', async () => {
      const itemDto = new CreateOrderItemDto();
      itemDto.productId = '11111111-1111-1111-1111-111111111111';
      itemDto.quantity = -5;
      itemDto.price = '10.00';

      const errors = await validate(itemDto);
      const quantityErrors = errors.filter(
        (error) => error.property === 'quantity',
      );
      expect(quantityErrors).toHaveLength(1);
      expect(quantityErrors[0].constraints?.isPositive).toBeDefined();
    });

    it('should validate string types correctly', async () => {
      const itemDto = new CreateOrderItemDto();
      itemDto.productId = '11111111-1111-1111-1111-111111111111';
      itemDto.quantity = 1;
      (itemDto as any).price = 10.0;

      const errors = await validate(itemDto);
      const priceErrors = errors.filter((error) => error.property === 'price');
      expect(priceErrors).toHaveLength(1);
      expect(priceErrors[0].constraints?.isString).toBeDefined();
    });

    it('should validate enum values correctly', async () => {
      const orderDto = new CreateOrderDto();
      (orderDto as any).status = 'INVALID_STATUS';
      orderDto.items = [
        {
          productId: '11111111-1111-1111-1111-111111111111',
          quantity: 1,
          price: '10.00',
        },
      ];

      const errors = await validate(orderDto);
      const statusErrors = errors.filter(
        (error) => error.property === 'status',
      );
      expect(statusErrors).toHaveLength(1);
      expect(statusErrors[0].constraints?.isEnum).toBeDefined();
    });

    it('should validate array types correctly', async () => {
      const orderDto = new CreateOrderDto();
      (orderDto as any).items = 'not-an-array';

      const errors = await validate(orderDto);
      const itemsErrors = errors.filter((error) => error.property === 'items');
      expect(itemsErrors).toHaveLength(1);
      expect(itemsErrors[0].constraints?.isArray).toBeDefined();
    });
  });
});
