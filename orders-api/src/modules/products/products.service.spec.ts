import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from '../../infra/database/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: jest.Mocked<Repository<Product>>;

  const mockProduct: Product = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Product',
    price: '99.99',
    stockQty: 10,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
  };

  const mockCreateProductDto: CreateProductDto = {
    name: 'Test Product',
    price: '99.99',
    stockQty: 10,
  };

  const mockUpdateProductDto: UpdateProductDto = {
    name: 'Updated Product',
    price: '149.99',
    stockQty: 15,
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      // Arrange
      const createdProduct = { ...mockProduct };
      repository.create.mockReturnValue(createdProduct as any);
      repository.save.mockResolvedValue(createdProduct);

      // Act
      const result = await service.create(mockCreateProductDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(mockCreateProductDto);
      expect(repository.save).toHaveBeenCalledWith(createdProduct);
      expect(result).toEqual(createdProduct);
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      // Arrange
      const products = [mockProduct];
      repository.find.mockResolvedValue(products);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(products);
    });

    it('should return empty array when no products exist', async () => {
      // Arrange
      repository.find.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a product when found', async () => {
      // Arrange
      const productId = mockProduct.id;
      repository.findOne.mockResolvedValue(mockProduct);

      // Act
      const result = await service.findOne(productId);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      // Arrange
      const productId = 'non-existent-id';
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(productId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(productId)).rejects.toThrow(
        'Product not found',
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });
  });

  describe('update', () => {
    it('should update a product when found', async () => {
      // Arrange
      const productId = mockProduct.id;
      const updatedProduct = { ...mockProduct, ...mockUpdateProductDto };
      repository.findOne.mockResolvedValue(mockProduct);
      repository.save.mockResolvedValue(updatedProduct);

      // Act
      const result = await service.update(productId, mockUpdateProductDto);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(repository.save).toHaveBeenCalledWith(updatedProduct);
      expect(result).toEqual(updatedProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      // Arrange
      const productId = 'non-existent-id';
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(productId, mockUpdateProductDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(productId, mockUpdateProductDto)).rejects.toThrow(
        'Product not found',
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should use Object.assign to merge product with update data', async () => {
      // Arrange
      const productId = mockProduct.id;
      const updatedProduct = { ...mockProduct, ...mockUpdateProductDto };
      repository.findOne.mockResolvedValue(mockProduct);
      repository.save.mockResolvedValue(updatedProduct);
      const objectAssignSpy = jest.spyOn(Object, 'assign');

      // Act
      await service.update(productId, mockUpdateProductDto);

      // Assert
      expect(objectAssignSpy).toHaveBeenCalledWith(mockProduct, mockUpdateProductDto);
      objectAssignSpy.mockRestore();
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      // Arrange
      const productId = mockProduct.id;
      repository.delete.mockResolvedValue({ affected: 1 } as any);

      // Act
      await service.remove(productId);

      // Assert
      expect(repository.delete).toHaveBeenCalledWith(productId);
    });

    it('should call repository.delete with correct id', async () => {
      // Arrange
      const productId = 'test-id-123';
      repository.delete.mockResolvedValue({ affected: 1 } as any);

      // Act
      await service.remove(productId);

      // Assert
      expect(repository.delete).toHaveBeenCalledTimes(1);
      expect(repository.delete).toHaveBeenCalledWith(productId);
    });
  });
});
