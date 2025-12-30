import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../common/logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { WarehousesService } from './warehouses.service';

describe('WarehousesService', () => {
  let service: WarehousesService;

  const mockPrismaService = {
    warehouse: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    stockMovement: {
      count: jest.fn(),
    },
    stockLevel: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
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
        WarehousesService,
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

    service = module.get<WarehousesService>(WarehousesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createWarehouseDto = {
      name: 'Armazém Teste',
      code: 'ARM-001',
      address: 'Rua Teste, 123',
      city: 'São Paulo',
      state: 'SP',
    };

    it('deve criar um armazém com sucesso', async () => {
      const mockWarehouse = {
        id: 'wh-1',
        ...createWarehouseDto,
        zipCode: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.warehouse.findUnique.mockResolvedValue(null);
      mockPrismaService.warehouse.create.mockResolvedValue(mockWarehouse);

      const result = await service.create(createWarehouseDto);

      expect(result).toEqual(mockWarehouse);
      expect(mockPrismaService.warehouse.create).toHaveBeenCalled();
      expect(mockLoggerService.log).toHaveBeenCalled();
    });

    it('deve lançar ConflictException se nome já existe', async () => {
      mockPrismaService.warehouse.findUnique.mockResolvedValue({
        id: 'wh-2',
        name: 'Armazém Teste',
      });

      await expect(service.create(createWarehouseDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve lançar ConflictException se código já existe', async () => {
      mockPrismaService.warehouse.findUnique
        .mockResolvedValueOnce(null) // name check
        .mockResolvedValueOnce({ id: 'wh-2', code: 'ARM-001' }); // code check

      await expect(service.create(createWarehouseDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de armazéns ativos', async () => {
      const mockWarehouses = [
        {
          id: 'wh-1',
          name: 'Armazém 1',
          isActive: true,
          _count: { stockLevels: 10, stockMovements: 50 },
        },
      ];

      mockPrismaService.warehouse.findMany.mockResolvedValue(mockWarehouses);

      const result = await service.findAll(false);

      expect(result).toEqual(mockWarehouses);
      expect(mockPrismaService.warehouse.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar um armazém por ID', async () => {
      const mockWarehouse = {
        id: 'wh-1',
        name: 'Armazém Teste',
        stockLevels: [],
        _count: { stockLevels: 0, stockMovements: 0 },
      };

      mockPrismaService.warehouse.findUnique.mockResolvedValue(mockWarehouse);

      const result = await service.findOne('wh-1');

      expect(result).toEqual(mockWarehouse);
    });

    it('deve lançar NotFoundException se armazém não existe', async () => {
      mockPrismaService.warehouse.findUnique.mockResolvedValue(null);

      await expect(service.findOne('wh-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateWarehouseDto = {
      name: 'Armazém Atualizado',
      address: 'Nova Rua, 456',
    };

    it('deve atualizar um armazém com sucesso', async () => {
      const existingWarehouse = {
        id: 'wh-1',
        name: 'Armazém Original',
      };
      const updatedWarehouse = {
        ...existingWarehouse,
        ...updateWarehouseDto,
      };

      mockPrismaService.warehouse.findUnique
        .mockResolvedValueOnce(existingWarehouse) // findOne check
        .mockResolvedValueOnce(null); // name check
      mockPrismaService.warehouse.update.mockResolvedValue(updatedWarehouse);

      const result = await service.update('wh-1', updateWarehouseDto);

      expect(result).toEqual(updatedWarehouse);
      expect(mockPrismaService.warehouse.update).toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se armazém não existe', async () => {
      mockPrismaService.warehouse.findUnique.mockResolvedValue(null);

      await expect(
        service.update('wh-999', updateWarehouseDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ConflictException se nome duplicado', async () => {
      const existingWarehouse = { id: 'wh-1', name: 'Armazém' };
      const updateWithName = { name: 'Armazém Duplicado' };

      mockPrismaService.warehouse.findUnique
        .mockResolvedValueOnce(existingWarehouse)
        .mockResolvedValueOnce({ id: 'wh-2', name: 'Armazém Duplicado' });

      await expect(service.update('wh-1', updateWithName)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('deve remover um armazém sem movimentações', async () => {
      const mockWarehouse = {
        id: 'wh-1',
        name: 'Armazém Teste',
      };

      mockPrismaService.warehouse.findUnique.mockResolvedValue(mockWarehouse);
      mockPrismaService.stockMovement.count.mockResolvedValue(0);
      mockPrismaService.stockLevel.deleteMany.mockResolvedValue({ count: 0 });
      mockPrismaService.warehouse.delete.mockResolvedValue(mockWarehouse);

      const result = await service.remove('wh-1');

      expect(result).toEqual({ message: 'Armazém removido com sucesso' });
      expect(mockPrismaService.stockLevel.deleteMany).toHaveBeenCalled();
      expect(mockPrismaService.warehouse.delete).toHaveBeenCalled();
    });

    it('deve desativar armazém com movimentações', async () => {
      const mockWarehouse = {
        id: 'wh-1',
        name: 'Armazém Teste',
        isActive: true,
      };

      mockPrismaService.warehouse.findUnique.mockResolvedValue(mockWarehouse);
      mockPrismaService.stockMovement.count.mockResolvedValue(10);
      mockPrismaService.warehouse.update.mockResolvedValue({
        ...mockWarehouse,
        isActive: false,
      });

      const result = await service.remove('wh-1');

      expect(result.message).toContain('desativado');
      expect(mockPrismaService.warehouse.update).toHaveBeenCalledWith({
        where: { id: 'wh-1' },
        data: { isActive: false },
      });
      expect(mockPrismaService.warehouse.delete).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se armazém não existe', async () => {
      mockPrismaService.warehouse.findUnique.mockResolvedValue(null);

      await expect(service.remove('wh-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getInventory', () => {
    it('deve retornar inventário do armazém', async () => {
      const mockWarehouse = {
        id: 'wh-1',
        name: 'Armazém Teste',
        code: 'ARM-001',
      };
      const mockInventory = [
        {
          id: 'sl-1',
          quantity: 50,
          minStock: 10,
          product: {
            id: 'prod-1',
            sku: 'PROD-001',
            name: 'Produto',
            unit: 'UN',
            minStock: 10,
            category: { id: 'cat-1', name: 'Categoria' },
          },
        },
      ];

      mockPrismaService.warehouse.findUnique.mockResolvedValue(mockWarehouse);
      mockPrismaService.stockLevel.findMany.mockResolvedValue(mockInventory);

      const result = await service.getInventory('wh-1');

      expect(result.warehouse).toEqual({
        id: mockWarehouse.id,
        name: mockWarehouse.name,
        code: mockWarehouse.code,
      });
      expect(result.inventory).toHaveLength(1);
      expect(result.summary.totalProducts).toBe(1);
      expect(result.summary.totalItems).toBe(50);
    });
  });
});
