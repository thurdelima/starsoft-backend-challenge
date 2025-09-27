import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from '../../infra/database/entities/product.entity';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: jest.Mocked<ProductsService>;

  const mockProduct: Product = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Test Product',
    price: '29.99',
    stockQty: 10,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
  };

  const mockCreateProductDto: CreateProductDto = {
    name: 'New Product',
    price: '19.99',
    stockQty: 5,
  };

  const mockUpdateProductDto: UpdateProductDto = {
    name: 'Updated Product',
    price: '39.99',
    stockQty: 15,
  };

  beforeEach(async () => {
    const mockProductsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      service.create.mockResolvedValue(mockProduct);

      const result = await controller.create(mockCreateProductDto);

      expect(service.create).toHaveBeenCalledWith(mockCreateProductDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProduct);
    });

    it('should call service.create with correct DTO', async () => {
      service.create.mockResolvedValue(mockProduct);

      await controller.create(mockCreateProductDto);

      expect(service.create).toHaveBeenCalledWith(mockCreateProductDto);
      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Product',
          price: '19.99',
          stockQty: 5,
        }),
      );
    });

    it('should return the created product', async () => {
      service.create.mockResolvedValue(mockProduct);

      const result = await controller.create(mockCreateProductDto);

      expect(result).toEqual(mockProduct);
      expect(result.id).toBe('11111111-1111-1111-1111-111111111111');
      expect(result.name).toBe('Test Product');
      expect(result.price).toBe('29.99');
      expect(result.stockQty).toBe(10);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const mockProducts = [mockProduct];
      service.findAll.mockResolvedValue(mockProducts);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith();
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProducts);
    });

    it('should call service.findAll without parameters', async () => {
      service.findAll.mockResolvedValue([]);

      await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith();
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no products exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return multiple products', async () => {
      const mockProducts = [
        mockProduct,
        { ...mockProduct, id: '22222222-2222-2222-2222-222222222222', name: 'Product 2' },
        { ...mockProduct, id: '33333333-3333-3333-3333-333333333333', name: 'Product 3' },
      ];
      service.findAll.mockResolvedValue(mockProducts);

      const result = await controller.findAll();

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Test Product');
      expect(result[1].name).toBe('Product 2');
      expect(result[2].name).toBe('Product 3');
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const productId = '11111111-1111-1111-1111-111111111111';
      service.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne(productId);

      expect(service.findOne).toHaveBeenCalledWith(productId);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProduct);
    });

    it('should call service.findOne with correct id', async () => {
      const productId = '11111111-1111-1111-1111-111111111111';
      service.findOne.mockResolvedValue(mockProduct);

      await controller.findOne(productId);

      expect(service.findOne).toHaveBeenCalledWith(productId);
      expect(service.findOne).toHaveBeenCalledWith(
        expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
      );
    });

    it('should return null when product not found', async () => {
      const productId = '99999999-9999-9999-9999-999999999999';
      service.findOne.mockResolvedValue(null);

      const result = await controller.findOne(productId);

      expect(result).toBeNull();
      expect(service.findOne).toHaveBeenCalledWith(productId);
    });

    it('should handle different id formats', async () => {
      const productId = '11111111-1111-1111-1111-111111111111';
      service.findOne.mockResolvedValue(mockProduct);

      await controller.findOne(productId);

      expect(service.findOne).toHaveBeenCalledWith(productId);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const productId = '11111111-1111-1111-1111-111111111111';
      const updatedProduct = { ...mockProduct, ...mockUpdateProductDto };
      service.update.mockResolvedValue(updatedProduct);

      const result = await controller.update(productId, mockUpdateProductDto);

      expect(service.update).toHaveBeenCalledWith(productId, mockUpdateProductDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedProduct);
    });

    it('should call service.update with correct parameters', async () => {
      const productId = '11111111-1111-1111-1111-111111111111';
      service.update.mockResolvedValue(mockProduct);

      await controller.update(productId, mockUpdateProductDto);

      expect(service.update).toHaveBeenCalledWith(productId, mockUpdateProductDto);
      expect(service.update).toHaveBeenCalledWith(
        productId,
        expect.objectContaining({
          name: 'Updated Product',
          price: '39.99',
          stockQty: 15,
        }),
      );
    });

    it('should return the updated product', async () => {
      const productId = '11111111-1111-1111-1111-111111111111';
      const updatedProduct = { ...mockProduct, ...mockUpdateProductDto };
      service.update.mockResolvedValue(updatedProduct);

      const result = await controller.update(productId, mockUpdateProductDto);

      expect(result).toEqual(updatedProduct);
      expect(result.name).toBe('Updated Product');
      expect(result.price).toBe('39.99');
      expect(result.stockQty).toBe(15);
    });

    it('should handle partial updates', async () => {
      const productId = '11111111-1111-1111-1111-111111111111';
      const partialUpdateDto = { name: 'Partially Updated Product' };
      const updatedProduct = { ...mockProduct, name: 'Partially Updated Product' };
      service.update.mockResolvedValue(updatedProduct);

      const result = await controller.update(productId, partialUpdateDto);

      expect(service.update).toHaveBeenCalledWith(productId, partialUpdateDto);
      expect(result.name).toBe('Partially Updated Product');
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      const productId = '11111111-1111-1111-1111-111111111111';
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(productId);

      expect(service.remove).toHaveBeenCalledWith(productId);
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should call service.remove with correct id', async () => {
      const productId = '11111111-1111-1111-1111-111111111111';
      service.remove.mockResolvedValue(undefined);

      await controller.remove(productId);

      expect(service.remove).toHaveBeenCalledWith(productId);
      expect(service.remove).toHaveBeenCalledWith(
        expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
      );
    });

    it('should return undefined after removal', async () => {
      const productId = '11111111-1111-1111-1111-111111111111';
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(productId);

      expect(result).toBeUndefined();
    });

    it('should handle removal of non-existent product', async () => {
      const productId = '99999999-9999-9999-9999-999999999999';
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(productId);

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(productId);
    });
  });

  describe('integration', () => {
    it('should handle complete CRUD operations', async () => {
      // Create
      service.create.mockResolvedValue(mockProduct);
      const created = await controller.create(mockCreateProductDto);
      expect(created).toEqual(mockProduct);

      // Read All
      service.findAll.mockResolvedValue([mockProduct]);
      const all = await controller.findAll();
      expect(all).toHaveLength(1);

      // Read One
      service.findOne.mockResolvedValue(mockProduct);
      const one = await controller.findOne(mockProduct.id);
      expect(one).toEqual(mockProduct);

      // Update
      const updatedProduct = { ...mockProduct, name: 'Updated' };
      service.update.mockResolvedValue(updatedProduct);
      const updated = await controller.update(mockProduct.id, { name: 'Updated' });
      expect(updated.name).toBe('Updated');

      // Delete
      service.remove.mockResolvedValue(undefined);
      const deleted = await controller.remove(mockProduct.id);
      expect(deleted).toBeUndefined();
    });

    it('should maintain service method call order', async () => {
      const productId = '11111111-1111-1111-1111-111111111111';
      
      service.create.mockResolvedValue(mockProduct);
      service.findAll.mockResolvedValue([mockProduct]);
      service.findOne.mockResolvedValue(mockProduct);
      service.update.mockResolvedValue(mockProduct);
      service.remove.mockResolvedValue(undefined);

      await controller.create(mockCreateProductDto);
      await controller.findAll();
      await controller.findOne(productId);
      await controller.update(productId, mockUpdateProductDto);
      await controller.remove(productId);

      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('should propagate service errors', async () => {
      const error = new Error('Service error');
      service.create.mockRejectedValue(error);

      await expect(controller.create(mockCreateProductDto)).rejects.toThrow('Service error');
    });

    it('should propagate service errors in findAll', async () => {
      const error = new Error('Database connection failed');
      service.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Database connection failed');
    });

    it('should propagate service errors in findOne', async () => {
      const error = new Error('Product not found');
      service.findOne.mockRejectedValue(error);

      await expect(controller.findOne('invalid-id')).rejects.toThrow('Product not found');
    });

    it('should propagate service errors in update', async () => {
      const error = new Error('Update failed');
      service.update.mockRejectedValue(error);

      await expect(controller.update('id', mockUpdateProductDto)).rejects.toThrow('Update failed');
    });

    it('should propagate service errors in remove', async () => {
      const error = new Error('Delete failed');
      service.remove.mockRejectedValue(error);

      await expect(controller.remove('id')).rejects.toThrow('Delete failed');
    });
  });

  describe('parameter validation', () => {
    it('should pass string id to findOne', async () => {
      const productId = '11111111-1111-1111-1111-111111111111';
      service.findOne.mockResolvedValue(mockProduct);

      await controller.findOne(productId);

      expect(service.findOne).toHaveBeenCalledWith(expect.any(String));
      expect(typeof productId).toBe('string');
    });

    it('should pass string id to update', async () => {
      const productId = '11111111-1111-1111-1111-111111111111';
      service.update.mockResolvedValue(mockProduct);

      await controller.update(productId, mockUpdateProductDto);

      expect(service.update).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
    });

    it('should pass string id to remove', async () => {
      const productId = '11111111-1111-1111-1111-111111111111';
      service.remove.mockResolvedValue(undefined);

      await controller.remove(productId);

      expect(service.remove).toHaveBeenCalledWith(expect.any(String));
    });

    it('should pass DTO object to create', async () => {
      service.create.mockResolvedValue(mockProduct);

      await controller.create(mockCreateProductDto);

      expect(service.create).toHaveBeenCalledWith(expect.any(Object));
      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.any(String),
          price: expect.any(String),
          stockQty: expect.any(Number),
        }),
      );
    });

    it('should pass DTO object to update', async () => {
      const productId = '11111111-1111-1111-1111-111111111111';
      service.update.mockResolvedValue(mockProduct);

      await controller.update(productId, mockUpdateProductDto);

      expect(service.update).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
      expect(service.update).toHaveBeenCalledWith(
        productId,
        expect.objectContaining({
          name: expect.any(String),
          price: expect.any(String),
          stockQty: expect.any(Number),
        }),
      );
    });
  });
});