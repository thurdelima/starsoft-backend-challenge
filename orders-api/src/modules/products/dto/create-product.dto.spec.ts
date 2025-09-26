import { validate } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

describe('CreateProductDto', () => {
  let dto: CreateProductDto;

  beforeEach(() => {
    dto = new CreateProductDto();
  });

  it('should be defined', () => {
    expect(dto).toBeDefined();
  });

  describe('validation', () => {
    describe('name', () => {
      it('should pass validation with valid string', async () => {
        dto.name = 'Test Product';
        dto.price = '99.99';
        dto.stockQty = 10;

        const errors = await validate(dto);
        const nameErrors = errors.filter((error) => error.property === 'name');
        expect(nameErrors).toHaveLength(0);
      });

      it('should fail validation with empty string', async () => {
        dto.name = '';
        dto.price = '99.99';
        dto.stockQty = 10;

        const errors = await validate(dto);
        const nameErrors = errors.filter((error) => error.property === 'name');
        expect(nameErrors).toHaveLength(1);
        expect(nameErrors[0].constraints?.isNotEmpty).toBeDefined();
      });

      it('should fail validation with non-string value', async () => {
        (dto as any).name = 123;
        dto.price = '99.99';
        dto.stockQty = 10;

        const errors = await validate(dto);
        const nameErrors = errors.filter((error) => error.property === 'name');
        expect(nameErrors).toHaveLength(1);
        expect(nameErrors[0].constraints?.isString).toBeDefined();
      });

      it('should fail validation with null value', async () => {
        (dto as any).name = null;
        dto.price = '99.99';
        dto.stockQty = 10;

        const errors = await validate(dto);
        const nameErrors = errors.filter((error) => error.property === 'name');
        expect(nameErrors).toHaveLength(1);
        expect(nameErrors[0].constraints?.isString).toBeDefined();
      });

      it('should fail validation with undefined value', async () => {
        (dto as any).name = undefined;
        dto.price = '99.99';
        dto.stockQty = 10;

        const errors = await validate(dto);
        const nameErrors = errors.filter((error) => error.property === 'name');
        expect(nameErrors).toHaveLength(1);
        expect(nameErrors[0].constraints?.isString).toBeDefined();
      });
    });

    describe('price', () => {
      it('should pass validation with valid decimal string', async () => {
        dto.name = 'Test Product';
        dto.price = '199.90';
        dto.stockQty = 10;

        const errors = await validate(dto);
        const priceErrors = errors.filter(
          (error) => error.property === 'price',
        );
        expect(priceErrors).toHaveLength(0);
      });

      it('should pass validation with valid integer string', async () => {
        dto.name = 'Test Product';
        dto.price = '100';
        dto.stockQty = 10;

        const errors = await validate(dto);
        const priceErrors = errors.filter(
          (error) => error.property === 'price',
        );
        expect(priceErrors).toHaveLength(0);
      });

      it('should fail validation with non-numeric string', async () => {
        dto.name = 'Test Product';
        dto.price = 'abc';
        dto.stockQty = 10;

        const errors = await validate(dto);
        const priceErrors = errors.filter(
          (error) => error.property === 'price',
        );
        expect(priceErrors).toHaveLength(1);
        expect(priceErrors[0].constraints?.isNumberString).toBeDefined();
      });

      it('should fail validation with non-string value', async () => {
        dto.name = 'Test Product';
        (dto as any).price = 199.9;
        dto.stockQty = 10;

        const errors = await validate(dto);
        const priceErrors = errors.filter(
          (error) => error.property === 'price',
        );
        expect(priceErrors).toHaveLength(1);
        expect(priceErrors[0].constraints?.isString).toBeDefined();
      });

      it('should fail validation with null value', async () => {
        dto.name = 'Test Product';
        (dto as any).price = null;
        dto.stockQty = 10;

        const errors = await validate(dto);
        const priceErrors = errors.filter(
          (error) => error.property === 'price',
        );
        expect(priceErrors).toHaveLength(1);
        expect(priceErrors[0].constraints?.isString).toBeDefined();
      });

      it('should fail validation with undefined value', async () => {
        dto.name = 'Test Product';
        (dto as any).price = undefined;
        dto.stockQty = 10;

        const errors = await validate(dto);
        const priceErrors = errors.filter(
          (error) => error.property === 'price',
        );
        expect(priceErrors).toHaveLength(1);
        expect(priceErrors[0].constraints?.isString).toBeDefined();
      });
    });

    describe('stockQty', () => {
      it('should pass validation with positive integer', async () => {
        dto.name = 'Test Product';
        dto.price = '99.99';
        dto.stockQty = 25;

        const errors = await validate(dto);
        const stockQtyErrors = errors.filter(
          (error) => error.property === 'stockQty',
        );
        expect(stockQtyErrors).toHaveLength(0);
      });

      it('should pass validation with minimum positive value', async () => {
        dto.name = 'Test Product';
        dto.price = '99.99';
        dto.stockQty = 1;

        const errors = await validate(dto);
        const stockQtyErrors = errors.filter(
          (error) => error.property === 'stockQty',
        );
        expect(stockQtyErrors).toHaveLength(0);
      });

      it('should fail validation with negative number', async () => {
        dto.name = 'Test Product';
        dto.price = '99.99';
        dto.stockQty = -5;

        const errors = await validate(dto);
        const stockQtyErrors = errors.filter(
          (error) => error.property === 'stockQty',
        );
        expect(stockQtyErrors).toHaveLength(1);
        expect(stockQtyErrors[0].constraints?.isPositive).toBeDefined();
      });

      it('should fail validation with zero', async () => {
        dto.name = 'Test Product';
        dto.price = '99.99';
        dto.stockQty = 0;

        const errors = await validate(dto);
        const stockQtyErrors = errors.filter(
          (error) => error.property === 'stockQty',
        );
        expect(stockQtyErrors).toHaveLength(1);
        expect(stockQtyErrors[0].constraints?.isPositive).toBeDefined();
      });

      it('should fail validation with decimal number', async () => {
        dto.name = 'Test Product';
        dto.price = '99.99';
        dto.stockQty = 25.5;

        const errors = await validate(dto);
        const stockQtyErrors = errors.filter(
          (error) => error.property === 'stockQty',
        );
        expect(stockQtyErrors).toHaveLength(1);
        expect(stockQtyErrors[0].constraints?.isInt).toBeDefined();
      });

      it('should fail validation with non-number value', async () => {
        dto.name = 'Test Product';
        dto.price = '99.99';
        (dto as any).stockQty = '25';

        const errors = await validate(dto);
        const stockQtyErrors = errors.filter(
          (error) => error.property === 'stockQty',
        );
        expect(stockQtyErrors).toHaveLength(1);
        expect(stockQtyErrors[0].constraints?.isInt).toBeDefined();
      });

      it('should fail validation with null value', async () => {
        dto.name = 'Test Product';
        dto.price = '99.99';
        (dto as any).stockQty = null;

        const errors = await validate(dto);
        const stockQtyErrors = errors.filter(
          (error) => error.property === 'stockQty',
        );
        expect(stockQtyErrors).toHaveLength(1);
        expect(stockQtyErrors[0].constraints?.isInt).toBeDefined();
      });

      it('should fail validation with undefined value', async () => {
        dto.name = 'Test Product';
        dto.price = '99.99';
        (dto as any).stockQty = undefined;

        const errors = await validate(dto);
        const stockQtyErrors = errors.filter(
          (error) => error.property === 'stockQty',
        );
        expect(stockQtyErrors).toHaveLength(1);
        expect(stockQtyErrors[0].constraints?.isInt).toBeDefined();
      });
    });
  });

  describe('integration', () => {
    it('should pass validation with complete valid DTO', async () => {
      dto.name = 'Fone de Ouvido Bluetooth';
      dto.price = '199.90';
      dto.stockQty = 25;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with multiple invalid fields', async () => {
      dto.name = '';
      dto.price = 'abc';
      dto.stockQty = -5;

      const errors = await validate(dto);
      expect(errors).toHaveLength(3);

      const nameErrors = errors.filter((error) => error.property === 'name');
      const priceErrors = errors.filter((error) => error.property === 'price');
      const stockQtyErrors = errors.filter(
        (error) => error.property === 'stockQty',
      );

      expect(nameErrors).toHaveLength(1);
      expect(priceErrors).toHaveLength(1);
      expect(stockQtyErrors).toHaveLength(1);
    });

    it('should pass validation with edge case values', async () => {
      dto.name = 'A';
      dto.price = '0.01';
      dto.stockQty = 1;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with large values', async () => {
      dto.name = 'Product with very long name that should still be valid';
      dto.price = '999999.99';
      dto.stockQty = 999999;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('property assignment', () => {
    it('should allow property assignment', () => {
      dto.name = 'Test Product';
      dto.price = '99.99';
      dto.stockQty = 10;

      expect(dto.name).toBe('Test Product');
      expect(dto.price).toBe('99.99');
      expect(dto.stockQty).toBe(10);
    });

    it('should allow property modification', () => {
      dto.name = 'Original Name';
      dto.price = '50.00';
      dto.stockQty = 5;

      dto.name = 'Updated Name';
      dto.price = '75.50';
      dto.stockQty = 15;

      expect(dto.name).toBe('Updated Name');
      expect(dto.price).toBe('75.50');
      expect(dto.stockQty).toBe(15);
    });
  });
});
