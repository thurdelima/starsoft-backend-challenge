import { validate } from 'class-validator';
import { UpdateProductDto } from './update-product.dto';
import { CreateProductDto } from './create-product.dto';

describe('UpdateProductDto', () => {
  let dto: UpdateProductDto;

  beforeEach(() => {
    dto = new UpdateProductDto();
  });

  it('should be defined', () => {
    expect(dto).toBeDefined();
  });

  describe('inheritance', () => {
    it('should have all properties from CreateProductDto', () => {
      dto.name = 'test';
      dto.price = '99.99';
      dto.stockQty = 10;

      expect(dto).toHaveProperty('name');
      expect(dto).toHaveProperty('price');
      expect(dto).toHaveProperty('stockQty');
    });

    it('should be compatible with CreateProductDto structure', () => {
      const createDto = new CreateProductDto();
      createDto.name = 'Test Product';
      createDto.price = '99.99';
      createDto.stockQty = 10;

      dto.name = createDto.name;
      dto.price = createDto.price;
      dto.stockQty = createDto.stockQty;

      expect(dto.name).toBe(createDto.name);
      expect(dto.price).toBe(createDto.price);
      expect(dto.stockQty).toBe(createDto.stockQty);
    });
  });

  describe('optional fields', () => {
    it('should pass validation with all fields undefined', async () => {
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with empty object', async () => {
      const emptyDto = new UpdateProductDto();
      const errors = await validate(emptyDto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with only name provided', async () => {
      dto.name = 'Test Product';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with only price provided', async () => {
      dto.price = '99.99';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with only stockQty provided', async () => {
      dto.stockQty = 10;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with two fields provided', async () => {
      dto.name = 'Test Product';
      dto.price = '99.99';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with all fields provided', async () => {
      dto.name = 'Test Product';
      dto.price = '99.99';
      dto.stockQty = 10;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('validation when fields provided', () => {
    describe('name validation', () => {
      it('should pass validation with valid name', async () => {
        dto.name = 'Valid Product Name';

        const errors = await validate(dto);
        const nameErrors = errors.filter((error) => error.property === 'name');
        expect(nameErrors).toHaveLength(0);
      });

      it('should fail validation with empty name', async () => {
        dto.name = '';

        const errors = await validate(dto);
        const nameErrors = errors.filter((error) => error.property === 'name');
        expect(nameErrors).toHaveLength(1);
        expect(nameErrors[0].constraints?.isNotEmpty).toBeDefined();
      });

      it('should fail validation with non-string name', async () => {
        (dto as any).name = 123;

        const errors = await validate(dto);
        const nameErrors = errors.filter((error) => error.property === 'name');
        expect(nameErrors).toHaveLength(1);
        expect(nameErrors[0].constraints?.isString).toBeDefined();
      });
    });

    describe('price validation', () => {
      it('should pass validation with valid decimal price', async () => {
        dto.price = '199.90';

        const errors = await validate(dto);
        const priceErrors = errors.filter(
          (error) => error.property === 'price',
        );
        expect(priceErrors).toHaveLength(0);
      });

      it('should pass validation with valid integer price', async () => {
        dto.price = '100';

        const errors = await validate(dto);
        const priceErrors = errors.filter(
          (error) => error.property === 'price',
        );
        expect(priceErrors).toHaveLength(0);
      });

      it('should fail validation with non-numeric price', async () => {
        dto.price = 'abc';

        const errors = await validate(dto);
        const priceErrors = errors.filter(
          (error) => error.property === 'price',
        );
        expect(priceErrors).toHaveLength(1);
        expect(priceErrors[0].constraints?.isNumberString).toBeDefined();
      });

      it('should fail validation with non-string price', async () => {
        (dto as any).price = 199.9;

        const errors = await validate(dto);
        const priceErrors = errors.filter(
          (error) => error.property === 'price',
        );
        expect(priceErrors).toHaveLength(1);
        expect(priceErrors[0].constraints?.isString).toBeDefined();
      });
    });

    describe('stockQty validation', () => {
      it('should pass validation with valid positive integer', async () => {
        dto.stockQty = 25;

        const errors = await validate(dto);
        const stockQtyErrors = errors.filter(
          (error) => error.property === 'stockQty',
        );
        expect(stockQtyErrors).toHaveLength(0);
      });

      it('should pass validation with minimum positive value', async () => {
        dto.stockQty = 1;

        const errors = await validate(dto);
        const stockQtyErrors = errors.filter(
          (error) => error.property === 'stockQty',
        );
        expect(stockQtyErrors).toHaveLength(0);
      });

      it('should fail validation with negative stockQty', async () => {
        dto.stockQty = -5;

        const errors = await validate(dto);
        const stockQtyErrors = errors.filter(
          (error) => error.property === 'stockQty',
        );
        expect(stockQtyErrors).toHaveLength(1);
        expect(stockQtyErrors[0].constraints?.isPositive).toBeDefined();
      });

      it('should fail validation with zero stockQty', async () => {
        dto.stockQty = 0;

        const errors = await validate(dto);
        const stockQtyErrors = errors.filter(
          (error) => error.property === 'stockQty',
        );
        expect(stockQtyErrors).toHaveLength(1);
        expect(stockQtyErrors[0].constraints?.isPositive).toBeDefined();
      });

      it('should fail validation with decimal stockQty', async () => {
        dto.stockQty = 25.5;

        const errors = await validate(dto);
        const stockQtyErrors = errors.filter(
          (error) => error.property === 'stockQty',
        );
        expect(stockQtyErrors).toHaveLength(1);
        expect(stockQtyErrors[0].constraints?.isInt).toBeDefined();
      });

      it('should fail validation with non-number stockQty', async () => {
        (dto as any).stockQty = '25';

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

    it('should pass validation with partial valid DTO', async () => {
      dto.name = 'Test Product';
      dto.stockQty = 10;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid provided fields', async () => {
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

    it('should pass validation with mixed valid and undefined fields', async () => {
      dto.name = 'Valid Product';
      dto.price = undefined;
      dto.stockQty = 15;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
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

    it('should allow partial property assignment', () => {
      dto.name = 'Test Product';

      expect(dto.name).toBe('Test Product');
      expect(dto.price).toBeUndefined();
      expect(dto.stockQty).toBeUndefined();
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

    it('should allow setting properties to undefined', () => {
      dto.name = 'Test Product';
      dto.price = '99.99';
      dto.stockQty = 10;

      dto.name = undefined;
      dto.price = undefined;
      dto.stockQty = undefined;

      expect(dto.name).toBeUndefined();
      expect(dto.price).toBeUndefined();
      expect(dto.stockQty).toBeUndefined();
    });
  });

  describe('PartialType behavior', () => {
    it('should make all fields optional', () => {
      const emptyDto = new UpdateProductDto();
      expect(emptyDto.name).toBeUndefined();
      expect(emptyDto.price).toBeUndefined();
      expect(emptyDto.stockQty).toBeUndefined();
    });

    it('should allow selective field updates', () => {
      const updateDto = new UpdateProductDto();
      updateDto.name = 'Updated Name';

      expect(updateDto.name).toBe('Updated Name');
      expect(updateDto.price).toBeUndefined();
      expect(updateDto.stockQty).toBeUndefined();
    });

    it('should maintain field types when assigned', () => {
      dto.name = 'Test';
      dto.price = '99.99';
      dto.stockQty = 10;

      expect(typeof dto.name).toBe('string');
      expect(typeof dto.price).toBe('string');
      expect(typeof dto.stockQty).toBe('number');
    });
  });
});
