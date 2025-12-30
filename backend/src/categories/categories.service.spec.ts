import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../common/logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockPrismaService = {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      count: jest.fn(),
    },
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
        CategoriesService,
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

    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCategoryDto = {
      name: 'Categoria Teste',
      description: 'Descrição da categoria',
    };

    it('deve criar uma categoria com sucesso', async () => {
      const mockCategory = {
        id: 'cat-1',
        ...createCategoryDto,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.category.findUnique.mockResolvedValue(null);
      mockPrismaService.category.create.mockResolvedValue(mockCategory);

      const result = await service.create(createCategoryDto);

      expect(result).toEqual(mockCategory);
      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: createCategoryDto,
      });
      expect(mockLoggerService.log).toHaveBeenCalled();
    });

    it('deve lançar ConflictException se nome já existe', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({
        id: 'cat-2',
        name: 'Categoria Teste',
      });

      await expect(service.create(createCategoryDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.category.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de categorias ativas', async () => {
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'Categoria 1',
          isActive: true,
          _count: { products: 5 },
        },
      ];

      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll(false);

      expect(result).toEqual(mockCategories);
      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
        }),
      );
    });

    it('deve retornar todas as categorias incluindo inativas', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([]);

      await service.findAll(true);

      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar uma categoria por ID', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Categoria Teste',
        products: [],
        _count: { products: 0 },
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne('cat-1');

      expect(result).toEqual(mockCategory);
    });

    it('deve lançar NotFoundException se categoria não existe', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne('cat-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateCategoryDto = {
      name: 'Categoria Atualizada',
      description: 'Nova descrição',
    };

    it('deve atualizar uma categoria com sucesso', async () => {
      const existingCategory = {
        id: 'cat-1',
        name: 'Categoria Original',
      };
      const updatedCategory = {
        ...existingCategory,
        ...updateCategoryDto,
      };

      mockPrismaService.category.findUnique
        .mockResolvedValueOnce(existingCategory) // findOne check
        .mockResolvedValueOnce(null); // name check
      mockPrismaService.category.update.mockResolvedValue(updatedCategory);

      const result = await service.update('cat-1', updateCategoryDto);

      expect(result).toEqual(updatedCategory);
      expect(mockPrismaService.category.update).toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se categoria não existe', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(
        service.update('cat-999', updateCategoryDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ConflictException se nome duplicado', async () => {
      const existingCategory = { id: 'cat-1', name: 'Categoria' };
      const updateWithName = { name: 'Categoria Duplicada' };

      mockPrismaService.category.findUnique
        .mockResolvedValueOnce(existingCategory)
        .mockResolvedValueOnce({ id: 'cat-2', name: 'Categoria Duplicada' });

      await expect(service.update('cat-1', updateWithName)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('deve remover uma categoria sem produtos', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Categoria Teste',
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.category.delete.mockResolvedValue(mockCategory);

      const result = await service.remove('cat-1');

      expect(result).toEqual({ message: 'Categoria removida com sucesso' });
      expect(mockPrismaService.category.delete).toHaveBeenCalled();
    });

    it('deve lançar ConflictException se categoria tem produtos', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Categoria Teste',
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.product.count.mockResolvedValue(5);

      await expect(service.remove('cat-1')).rejects.toThrow(ConflictException);
      expect(mockPrismaService.category.delete).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se categoria não existe', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.remove('cat-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
