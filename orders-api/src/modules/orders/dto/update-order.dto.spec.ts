import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateOrderDto, UpdateOrderItemDto } from './update-order.dto';
import { OrderStatus } from '../../../infra/database/entities/order.entity';

describe('UpdateOrderDto', () => {
  describe('UpdateOrderItemDto', () => {
    let dto: UpdateOrderItemDto;

    beforeEach(() => {
      dto = new UpdateOrderItemDto();
    });

    it('should be defined', () => {
      expect(dto).toBeDefined();
    });

    describe('with id provided', () => {
      it('should fail validation with invalid id', async () => {
        dto.id = 'invalid-uuid';
        dto.quantity = 2;
        dto.price = '29.99';

        const errors = await validate(dto);
        const idErrors = errors.filter((error) => error.property === 'id');
        expect(idErrors).toHaveLength(1);
        expect(idErrors[0].constraints?.isUuid).toBeDefined();
      });

      it('should fail validation with missing quantity', async () => {
        dto.id = '11111111-1111-1111-1111-111111111111';
        dto.price = '29.99';

        const errors = await validate(dto);
        const quantityErrors = errors.filter(
          (error) => error.property === 'quantity',
        );
        expect(quantityErrors).toHaveLength(1);
        expect(quantityErrors[0].constraints?.isInt).toBeDefined();
      });

      it('should fail validation with missing price', async () => {
        dto.id = '11111111-1111-1111-1111-111111111111';
        dto.quantity = 2;

        const errors = await validate(dto);
        const priceErrors = errors.filter(
          (error) => error.property === 'price',
        );
        expect(priceErrors).toHaveLength(1);
        expect(priceErrors[0].constraints?.isString).toBeDefined();
      });
    });

    describe('without id', () => {
      it('should fail validation without productId when id is not provided', async () => {
        dto.quantity = 2;
        dto.price = '29.99';

        const errors = await validate(dto);
        const productIdErrors = errors.filter(
          (error) => error.property === 'productId',
        );
        expect(productIdErrors).toHaveLength(1);
        expect(productIdErrors[0].constraints?.isUuid).toBeDefined();
      });

      it('should fail validation with invalid productId', async () => {
        dto.productId = 'invalid-uuid';
        dto.quantity = 2;
        dto.price = '29.99';

        const errors = await validate(dto);
        const productIdErrors = errors.filter(
          (error) => error.property === 'productId',
        );
        expect(productIdErrors).toHaveLength(1);
        expect(productIdErrors[0].constraints?.isUuid).toBeDefined();
      });

      it('should fail validation with missing quantity', async () => {
        dto.productId = '11111111-1111-1111-1111-111111111111';
        dto.price = '29.99';

        const errors = await validate(dto);
        const quantityErrors = errors.filter(
          (error) => error.property === 'quantity',
        );
        expect(quantityErrors).toHaveLength(1);
        expect(quantityErrors[0].constraints?.isInt).toBeDefined();
      });

      it('should fail validation with missing price', async () => {
        dto.productId = '11111111-1111-1111-1111-111111111111';
        dto.quantity = 2;

        const errors = await validate(dto);
        const priceErrors = errors.filter(
          (error) => error.property === 'price',
        );
        expect(priceErrors).toHaveLength(1);
        expect(priceErrors[0].constraints?.isString).toBeDefined();
      });
    });

    describe('quantity validation', () => {
      it('should fail validation with zero quantity', async () => {
        dto.id = '11111111-1111-1111-1111-111111111111';
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
        dto.id = '11111111-1111-1111-1111-111111111111';
        dto.quantity = -1;
        dto.price = '29.99';

        const errors = await validate(dto);
        const quantityErrors = errors.filter(
          (error) => error.property === 'quantity',
        );
        expect(quantityErrors).toHaveLength(1);
        expect(quantityErrors[0].constraints?.isPositive).toBeDefined();
      });

      it('should fail validation with decimal quantity', async () => {
        dto.id = '11111111-1111-1111-1111-111111111111';
        dto.quantity = 2.5;
        dto.price = '29.99';

        const errors = await validate(dto);
        const quantityErrors = errors.filter(
          (error) => error.property === 'quantity',
        );
        expect(quantityErrors).toHaveLength(1);
        expect(quantityErrors[0].constraints?.isInt).toBeDefined();
      });

      it('should fail validation with non-number quantity', async () => {
        dto.id = '11111111-1111-1111-1111-111111111111';
        (dto as any).quantity = '2';
        dto.price = '29.99';

        const errors = await validate(dto);
        const quantityErrors = errors.filter(
          (error) => error.property === 'quantity',
        );
        expect(quantityErrors).toHaveLength(1);
        expect(quantityErrors[0].constraints?.isInt).toBeDefined();
      });
    });

    describe('price validation', () => {
      it('should fail validation with non-string price', async () => {
        dto.id = '11111111-1111-1111-1111-111111111111';
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
        dto.id = 'invalid-uuid';
        dto.quantity = -1;
        (dto as any).price = 29.99;

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('UpdateOrderDto', () => {
    let dto: UpdateOrderDto;

    beforeEach(() => {
      dto = new UpdateOrderDto();
    });

    it('should be defined', () => {
      expect(dto).toBeDefined();
    });

    describe('optional fields', () => {
      it('should pass validation with all fields undefined', async () => {
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });

      it('should pass validation with only status provided', async () => {
        dto.status = OrderStatus.PENDING;

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });

      it('should pass validation with empty items array', async () => {
        dto.items = [];

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });
    });

    describe('status validation', () => {
      it('should pass validation with valid status', async () => {
        dto.status = OrderStatus.PENDING;

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

          const errors = await validate(dto);
          const statusErrors = errors.filter(
            (error) => error.property === 'status',
          );
          expect(statusErrors).toHaveLength(0);
        }
      });

      it('should pass validation with undefined status', async () => {
        dto.status = undefined;

        const errors = await validate(dto);
        const statusErrors = errors.filter(
          (error) => error.property === 'status',
        );
        expect(statusErrors).toHaveLength(0);
      });

      it('should fail validation with invalid status', async () => {
        (dto as any).status = 'INVALID_STATUS';

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
            id: 'invalid-uuid',
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
        dto.items = [
          {
            id: 'invalid-uuid',
            quantity: -1,
            price: '',
          },
        ];

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('class-transformer integration', () => {
    it('should transform plain object to UpdateOrderDto', () => {
      const plainObject = {
        status: 'PENDING',
        items: [
          {
            id: '11111111-1111-1111-1111-111111111111',
            productId: '22222222-2222-2222-2222-222222222222',
            quantity: 2,
            price: '29.99',
          },
        ],
      };

      const transformedDto = plainToClass(UpdateOrderDto, plainObject);

      expect(transformedDto).toBeInstanceOf(UpdateOrderDto);
      expect(transformedDto.status).toBe(OrderStatus.PENDING);
      expect(transformedDto.items).toHaveLength(1);
      expect(transformedDto.items?.[0]).toBeInstanceOf(UpdateOrderItemDto);
    });

    it('should transform items array correctly', () => {
      const plainObject = {
        items: [
          {
            id: '11111111-1111-1111-1111-111111111111',
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

      const transformedDto = plainToClass(UpdateOrderDto, plainObject);

      expect(transformedDto.items).toHaveLength(2);
      transformedDto.items?.forEach((item) => {
        expect(item).toBeInstanceOf(UpdateOrderItemDto);
      });
    });

    it('should handle undefined values in transformation', () => {
      const plainObject = {
        items: [
          {
            productId: '11111111-1111-1111-1111-111111111111',
            quantity: 2,
            price: '29.99',
          },
        ],
      };

      const transformedDto = plainToClass(UpdateOrderDto, plainObject);

      expect(transformedDto.status).toBeUndefined();
      expect(transformedDto.items).toHaveLength(1);
    });
  });

  describe('property assignment', () => {
    it('should allow property assignment for UpdateOrderItemDto', () => {
      const itemDto = new UpdateOrderItemDto();
      itemDto.id = '11111111-1111-1111-1111-111111111111';
      itemDto.productId = '22222222-2222-2222-2222-222222222222';
      itemDto.quantity = 2;
      itemDto.price = '29.99';

      expect(itemDto.id).toBe('11111111-1111-1111-1111-111111111111');
      expect(itemDto.productId).toBe('22222222-2222-2222-2222-222222222222');
      expect(itemDto.quantity).toBe(2);
      expect(itemDto.price).toBe('29.99');
    });

    it('should allow property assignment for UpdateOrderDto', () => {
      const orderDto = new UpdateOrderDto();
      orderDto.status = OrderStatus.PROCESSING;
      orderDto.items = [
        {
          id: '11111111-1111-1111-1111-111111111111',
          productId: '22222222-2222-2222-2222-222222222222',
          quantity: 2,
          price: '29.99',
        },
      ];

      expect(orderDto.status).toBe(OrderStatus.PROCESSING);
      expect(orderDto.items).toHaveLength(1);
      expect(orderDto.items?.[0].id).toBe(
        '11111111-1111-1111-1111-111111111111',
      );
    });

    it('should allow modification of properties', () => {
      const orderDto = new UpdateOrderDto();
      orderDto.status = OrderStatus.PENDING;
      orderDto.items = [
        {
          id: '11111111-1111-1111-1111-111111111111',
          productId: '22222222-2222-2222-2222-222222222222',
          quantity: 2,
          price: '29.99',
        },
      ];

      orderDto.status = OrderStatus.PROCESSING;
      if (orderDto.items) {
        orderDto.items[0].quantity = 3;
      }

      expect(orderDto.status).toBe(OrderStatus.PROCESSING);
      expect(orderDto.items?.[0].quantity).toBe(3);
    });
  });

  describe('conditional validation edge cases', () => {
    it('should handle empty string id', async () => {
      const itemDto = new UpdateOrderItemDto();
      itemDto.id = '';
      itemDto.quantity = 2;
      itemDto.price = '29.99';

      const errors = await validate(itemDto);
      const idErrors = errors.filter((error) => error.property === 'id');
      const productIdErrors = errors.filter(
        (error) => error.property === 'productId',
      );

      expect(idErrors).toHaveLength(1);
      expect(productIdErrors).toHaveLength(1);
    });

    it('should handle null id', async () => {
      const itemDto = new UpdateOrderItemDto();
      (itemDto as any).id = null;
      itemDto.quantity = 2;
      itemDto.price = '29.99';

      const errors = await validate(itemDto);
      const productIdErrors = errors.filter(
        (error) => error.property === 'productId',
      );
      expect(productIdErrors).toHaveLength(1);
    });

    it('should handle undefined id', async () => {
      const itemDto = new UpdateOrderItemDto();
      itemDto.id = undefined;
      itemDto.quantity = 2;
      itemDto.price = '29.99';

      const errors = await validate(itemDto);
      const productIdErrors = errors.filter(
        (error) => error.property === 'productId',
      );
      expect(productIdErrors).toHaveLength(1);
    });
  });

  describe('DTO structure', () => {
    it('should have correct property types', () => {
      const itemDto = new UpdateOrderItemDto();
      const orderDto = new UpdateOrderDto();

      expect(typeof itemDto.id).toBe('undefined');
      expect(typeof itemDto.productId).toBe('undefined');
      expect(typeof itemDto.quantity).toBe('undefined');
      expect(typeof itemDto.price).toBe('undefined');

      expect(typeof orderDto.status).toBe('undefined');
      expect(Array.isArray(orderDto.items)).toBe(false);
    });

    it('should allow setting properties with correct types', () => {
      const itemDto = new UpdateOrderItemDto();
      itemDto.id = '11111111-1111-1111-1111-111111111111';
      itemDto.productId = '22222222-2222-2222-2222-222222222222';
      itemDto.quantity = 2;
      itemDto.price = '29.99';

      expect(typeof itemDto.id).toBe('string');
      expect(typeof itemDto.productId).toBe('string');
      expect(typeof itemDto.quantity).toBe('number');
      expect(typeof itemDto.price).toBe('string');
    });

    it('should handle array operations', () => {
      const orderDto = new UpdateOrderDto();
      orderDto.items = [
        {
          id: '11111111-1111-1111-1111-111111111111',
          productId: '22222222-2222-2222-2222-222222222222',
          quantity: 2,
          price: '29.99',
        },
      ];

      expect(Array.isArray(orderDto.items)).toBe(true);
      expect(orderDto.items).toHaveLength(1);
      expect(orderDto.items?.[0]).toHaveProperty('id');
      expect(orderDto.items?.[0]).toHaveProperty('quantity');
      expect(orderDto.items?.[0]).toHaveProperty('price');
    });
  });

  describe('validation constraints', () => {
    it('should validate UUID format correctly', async () => {
      const itemDto = new UpdateOrderItemDto();
      itemDto.id = 'not-a-uuid';
      itemDto.quantity = 1;
      itemDto.price = '10.00';

      const errors = await validate(itemDto);
      const idErrors = errors.filter((error) => error.property === 'id');
      expect(idErrors).toHaveLength(1);
      expect(idErrors[0].constraints?.isUuid).toBeDefined();
    });

    it('should validate positive numbers correctly', async () => {
      const itemDto = new UpdateOrderItemDto();
      itemDto.id = '11111111-1111-1111-1111-111111111111';
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
      const itemDto = new UpdateOrderItemDto();
      itemDto.id = '11111111-1111-1111-1111-111111111111';
      itemDto.quantity = 1;
      (itemDto as any).price = 10.0;

      const errors = await validate(itemDto);
      const priceErrors = errors.filter((error) => error.property === 'price');
      expect(priceErrors).toHaveLength(1);
      expect(priceErrors[0].constraints?.isString).toBeDefined();
    });

    it('should validate enum values correctly', async () => {
      const orderDto = new UpdateOrderDto();
      (orderDto as any).status = 'INVALID_STATUS';

      const errors = await validate(orderDto);
      const statusErrors = errors.filter(
        (error) => error.property === 'status',
      );
      expect(statusErrors).toHaveLength(1);
      expect(statusErrors[0].constraints?.isEnum).toBeDefined();
    });

    it('should validate array types correctly', async () => {
      const orderDto = new UpdateOrderDto();
      (orderDto as any).items = 'not-an-array';

      const errors = await validate(orderDto);
      const itemsErrors = errors.filter((error) => error.property === 'items');
      expect(itemsErrors).toHaveLength(1);
      expect(itemsErrors[0].constraints?.isArray).toBeDefined();
    });
  });
});
