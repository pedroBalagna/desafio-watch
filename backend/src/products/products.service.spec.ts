import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../common/logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockPrismaService = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
    supplier: {
      findUnique: jest.fn(),
    },
    stockMovement: {
      count: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  const mockLoggerService = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createProductDto = {
      sku: 'PROD-001',
      name: 'Produto Teste',
      description: 'Descrição do produto',
      unitPrice: 99.99,
      costPrice: 79.99,
      minStock: 10,
      maxStock: 100,
      currentStock: 50,
      unit: 'UN',
      categoryId: 'cat-1',
      supplierId: 'sup-1',
    };

    it('deve criar um produto com sucesso', async () => {
      const mockProduct = {
        id: 'prod-1',
        ...createProductDto,
        barcode: null,
        imageUrl: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: { id: 'cat-1', name: 'Categoria' },
        supplier: { id: 'sup-1', name: 'Fornecedor' },
      };

      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.category.findUnique.mockResolvedValue({
        id: 'cat-1',
        name: 'Categoria',
      });
      mockPrismaService.supplier.findUnique.mockResolvedValue({
        id: 'sup-1',
        name: 'Fornecedor',
      });
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(createProductDto);

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.create).toHaveBeenCalled();
      expect(mockLoggerService.log).toHaveBeenCalled();
    });

    it('deve lançar ConflictException se SKU já existe', async () => {
      mockPrismaService.product.findUnique.mockResolvedValueOnce({
        id: 'prod-2',
        sku: 'PROD-001',
      });

      await expect(service.create(createProductDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.product.create).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictException se código de barras já existe', async () => {
      const dtoWithBarcode = { ...createProductDto, barcode: '123456789' };

      mockPrismaService.product.findUnique
        .mockResolvedValueOnce(null) // SKU não existe
        .mockResolvedValueOnce({ id: 'prod-2', barcode: '123456789' }); // Barcode existe

      await expect(service.create(dtoWithBarcode)).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve lançar BadRequestException se categoria não existe', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.create(createProductDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException se fornecedor não existe', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.category.findUnique.mockResolvedValue({
        id: 'cat-1',
      });
      mockPrismaService.supplier.findUnique.mockResolvedValue(null);

      await expect(service.create(createProductDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar lista paginada de produtos', async () => {
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Produto 1',
          currentStock: 50,
          minStock: 10,
          category: { id: 'cat-1', name: 'Categoria' },
          supplier: { id: 'sup-1', name: 'Fornecedor' },
        },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.product.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...mockProducts[0],
            isLowStock: false,
            isOutOfStock: false,
          }),
        ]),
      );
      expect(result.meta.total).toBe(1);
    });

    it('deve filtrar produtos por busca', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({ search: 'teste', page: 1, limit: 20 });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: 'teste', mode: 'insensitive' } },
              { sku: { contains: 'teste', mode: 'insensitive' } },
              { barcode: { contains: 'teste', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar um produto por ID', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Produto Teste',
        currentStock: 50,
        minStock: 10,
        category: { id: 'cat-1', name: 'Categoria' },
        supplier: { id: 'sup-1', name: 'Fornecedor' },
        stockLevels: [],
        stockMovements: [],
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne('prod-1');

      expect(result).toEqual(
        expect.objectContaining({
          ...mockProduct,
          isLowStock: false,
          isOutOfStock: false,
        }),
      );
    });

    it('deve lançar NotFoundException se produto não existe', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('prod-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateProductDto = {
      name: 'Produto Atualizado',
      unitPrice: 109.99,
    };

    it('deve atualizar um produto com sucesso', async () => {
      const existingProduct = {
        id: 'prod-1',
        name: 'Produto Original',
        currentStock: 50,
        minStock: 10,
      };
      const updatedProduct = {
        ...existingProduct,
        ...updateProductDto,
        category: null,
        supplier: null,
      };

      mockPrismaService.product.findUnique
        .mockResolvedValueOnce(existingProduct) // findOne check
        .mockResolvedValueOnce(null); // SKU check (não atualizado)
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await service.update('prod-1', updateProductDto);

      expect(result).toEqual(updatedProduct);
      expect(mockPrismaService.product.update).toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se produto não existe', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(
        service.update('prod-999', updateProductDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ConflictException se SKU duplicado', async () => {
      const existingProduct = { id: 'prod-1', name: 'Produto' };
      const updateWithSku = { sku: 'PROD-002' };

      mockPrismaService.product.findUnique
        .mockResolvedValueOnce(existingProduct)
        .mockResolvedValueOnce({ id: 'prod-2', sku: 'PROD-002' });

      await expect(service.update('prod-1', updateWithSku)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('deve remover um produto sem movimentações', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Produto Teste',
        currentStock: 50,
        minStock: 10,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.stockMovement.count.mockResolvedValue(0);
      mockPrismaService.product.delete.mockResolvedValue(mockProduct);

      const result = await service.remove('prod-1');

      expect(result).toEqual({ message: 'Produto removido com sucesso' });
      expect(mockPrismaService.product.delete).toHaveBeenCalled();
    });

    it('deve desativar produto com movimentações', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Produto Teste',
        isActive: true,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.stockMovement.count.mockResolvedValue(5);
      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        isActive: false,
      });

      const result = await service.remove('prod-1');

      expect(result.message).toContain('desativado');
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { isActive: false },
      });
      expect(mockPrismaService.product.delete).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se produto não existe', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.remove('prod-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySku', () => {
    it('deve retornar produto por SKU', async () => {
      const mockProduct = {
        id: 'prod-1',
        sku: 'PROD-001',
        name: 'Produto Teste',
        category: null,
        supplier: null,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findBySku('PROD-001');

      expect(result).toEqual(mockProduct);
    });

    it('deve lançar NotFoundException se SKU não existe', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findBySku('PROD-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByBarcode', () => {
    it('deve retornar produto por código de barras', async () => {
      const mockProduct = {
        id: 'prod-1',
        barcode: '123456789',
        name: 'Produto Teste',
        category: null,
        supplier: null,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findByBarcode('123456789');

      expect(result).toEqual(mockProduct);
    });

    it('deve lançar NotFoundException se código de barras não existe', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findByBarcode('999999999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getLowStockProducts', () => {
    it('deve retornar produtos com estoque baixo ou zerado', async () => {
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Produto Baixo',
          currentStock: 5,
          minStock: 10,
          category: { id: 'cat-1', name: 'Categoria' },
          supplier: { id: 'sup-1', name: 'Fornecedor' },
        },
        {
          id: 'prod-2',
          name: 'Produto Zerado',
          currentStock: 0,
          minStock: 10,
          category: { id: 'cat-1', name: 'Categoria' },
          supplier: { id: 'sup-1', name: 'Fornecedor' },
        },
        {
          id: 'prod-3',
          name: 'Produto Normal',
          currentStock: 50,
          minStock: 10,
          category: { id: 'cat-1', name: 'Categoria' },
          supplier: { id: 'sup-1', name: 'Fornecedor' },
        },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.getLowStockProducts();

      expect(result).toHaveLength(2); // Produtos com estoque baixo ou zerado
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 'prod-1',
          isLowStock: true,
          isOutOfStock: false,
          deficit: 5,
        }),
      );
      expect(result[1]).toEqual(
        expect.objectContaining({
          id: 'prod-2',
          isLowStock: false,
          isOutOfStock: true,
          deficit: 10,
        }),
      );
    });
  });
});
