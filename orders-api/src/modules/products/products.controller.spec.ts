import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: jest.Mocked<ProductsService>;

  const mockProduct = {
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

  const mockProductsList = [mockProduct];

  beforeEach(async () => {
    const mockService = {
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
          useValue: mockService,
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
      // Arrange
      service.create.mockResolvedValue(mockProduct);

      // Act
      const result = await controller.create(mockCreateProductDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(mockCreateProductDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProduct);
    });

    it('should call service.create with correct DTO', async () => {
      // Arrange
      const customDto: CreateProductDto = {
        name: 'Custom Product',
        price: '199.99',
        stockQty: 5,
      };
      service.create.mockResolvedValue(mockProduct);

      // Act
      await controller.create(customDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(customDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      // Arrange
      service.findAll.mockResolvedValue(mockProductsList);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(service.findAll).toHaveBeenCalled();
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProductsList);
    });

    it('should return empty array when no products exist', async () => {
      // Arrange
      service.findAll.mockResolvedValue([]);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(service.findAll).toHaveBeenCalled();
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a product when found', async () => {
      // Arrange
      const productId = mockProduct.id;
      service.findOne.mockResolvedValue(mockProduct);

      // Act
      const result = await controller.findOne(productId);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(productId);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProduct);
    });

    it('should call service.findOne with correct id parameter', async () => {
      // Arrange
      const customId = 'custom-product-id';
      service.findOne.mockResolvedValue(mockProduct);

      // Act
      await controller.findOne(customId);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(customId);
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });

    it('should propagate service errors', async () => {
      // Arrange
      const productId = 'non-existent-id';
      const error = new Error('Product not found');
      service.findOne.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.findOne(productId)).rejects.toThrow(error);
      expect(service.findOne).toHaveBeenCalledWith(productId);
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      // Arrange
      const productId = mockProduct.id;
      const updatedProduct = { ...mockProduct, ...mockUpdateProductDto };
      service.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await controller.update(productId, mockUpdateProductDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(
        productId,
        mockUpdateProductDto,
      );
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedProduct);
    });

    it('should call service.update with correct parameters', async () => {
      // Arrange
      const customId = 'custom-product-id';
      const customDto: UpdateProductDto = {
        name: 'Custom Updated Product',
        price: '299.99',
      };
      const updatedProduct = { ...mockProduct, ...customDto };
      service.update.mockResolvedValue(updatedProduct);

      // Act
      await controller.update(customId, customDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(customId, customDto);
      expect(service.update).toHaveBeenCalledTimes(1);
    });

    it('should propagate service errors', async () => {
      // Arrange
      const productId = 'non-existent-id';
      const error = new Error('Product not found');
      service.update.mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.update(productId, mockUpdateProductDto),
      ).rejects.toThrow(error);
      expect(service.update).toHaveBeenCalledWith(
        productId,
        mockUpdateProductDto,
      );
      expect(service.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      // Arrange
      const productId = mockProduct.id;
      service.remove.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove(productId);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(productId);
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should call service.remove with correct id parameter', async () => {
      // Arrange
      const customId = 'custom-product-id';
      service.remove.mockResolvedValue(undefined);

      // Act
      await controller.remove(customId);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(customId);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });

    it('should propagate service errors', async () => {
      // Arrange
      const productId = 'non-existent-id';
      const error = new Error('Product not found');
      service.remove.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.remove(productId)).rejects.toThrow(error);
      expect(service.remove).toHaveBeenCalledWith(productId);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });

  describe('service integration', () => {
    it('should have all required service methods', () => {
      // Assert
      expect(service.create).toBeDefined();
      expect(service.findAll).toBeDefined();
      expect(service.findOne).toBeDefined();
      expect(service.update).toBeDefined();
      expect(service.remove).toBeDefined();
    });

    it('should call service methods with correct number of parameters', async () => {
      // Arrange
      const productId = mockProduct.id;
      service.create.mockResolvedValue(mockProduct);
      service.findAll.mockResolvedValue(mockProductsList);
      service.findOne.mockResolvedValue(mockProduct);
      service.update.mockResolvedValue(mockProduct);
      service.remove.mockResolvedValue(undefined);

      // Act
      await controller.create(mockCreateProductDto);
      await controller.findAll();
      await controller.findOne(productId);
      await controller.update(productId, mockUpdateProductDto);
      await controller.remove(productId);

      // Assert
      expect(service.create).toHaveBeenCalledWith(mockCreateProductDto);
      expect(service.findAll).toHaveBeenCalledWith();
      expect(service.findOne).toHaveBeenCalledWith(productId);
      expect(service.update).toHaveBeenCalledWith(
        productId,
        mockUpdateProductDto,
      );
      expect(service.remove).toHaveBeenCalledWith(productId);
    });
  });
});
