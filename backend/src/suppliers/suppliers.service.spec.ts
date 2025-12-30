import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../common/logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { SuppliersService } from './suppliers.service';

describe('SuppliersService', () => {
  let service: SuppliersService;

  const mockPrismaService = {
    supplier: {
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
        SuppliersService,
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

    service = module.get<SuppliersService>(SuppliersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createSupplierDto = {
      name: 'Fornecedor Teste',
      email: 'fornecedor@test.com',
      phone: '11999999999',
      cnpj: '12345678000190',
    };

    it('deve criar um fornecedor com sucesso', async () => {
      const mockSupplier = {
        id: 'sup-1',
        ...createSupplierDto,
        address: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.supplier.findUnique.mockResolvedValue(null);
      mockPrismaService.supplier.create.mockResolvedValue(mockSupplier);

      const result = await service.create(createSupplierDto);

      expect(result).toEqual(mockSupplier);
      expect(mockPrismaService.supplier.create).toHaveBeenCalled();
      expect(mockLoggerService.log).toHaveBeenCalled();
    });

    it('deve lançar ConflictException se email já existe', async () => {
      mockPrismaService.supplier.findUnique.mockResolvedValue({
        id: 'sup-2',
        email: 'fornecedor@test.com',
      });

      await expect(service.create(createSupplierDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.supplier.create).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictException se CNPJ já existe', async () => {
      const dtoWithCnpj = { ...createSupplierDto, email: 'novo@test.com' };

      mockPrismaService.supplier.findUnique
        .mockResolvedValueOnce(null) // Email check
        .mockResolvedValueOnce({ id: 'sup-2', cnpj: '12345678000190' }); // CNPJ check

      await expect(service.create(dtoWithCnpj)).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve criar fornecedor sem email e CNPJ', async () => {
      const dtoWithoutOptional = {
        name: 'Fornecedor Simples',
      };
      const mockSupplier = {
        id: 'sup-1',
        ...dtoWithoutOptional,
        email: null,
        phone: null,
        cnpj: null,
        address: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.supplier.findUnique.mockResolvedValue(null);
      mockPrismaService.supplier.create.mockResolvedValue(mockSupplier);

      const result = await service.create(dtoWithoutOptional);

      expect(result).toEqual(mockSupplier);
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de fornecedores ativos', async () => {
      const mockSuppliers = [
        {
          id: 'sup-1',
          name: 'Fornecedor 1',
          isActive: true,
          _count: { products: 5 },
        },
      ];

      mockPrismaService.supplier.findMany.mockResolvedValue(mockSuppliers);

      const result = await service.findAll(false);

      expect(result).toEqual(mockSuppliers);
      expect(mockPrismaService.supplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
        }),
      );
    });

    it('deve retornar todos os fornecedores incluindo inativos', async () => {
      mockPrismaService.supplier.findMany.mockResolvedValue([]);

      await service.findAll(true);

      expect(mockPrismaService.supplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar um fornecedor por ID', async () => {
      const mockSupplier = {
        id: 'sup-1',
        name: 'Fornecedor Teste',
        products: [],
        _count: { products: 0 },
      };

      mockPrismaService.supplier.findUnique.mockResolvedValue(mockSupplier);

      const result = await service.findOne('sup-1');

      expect(result).toEqual(mockSupplier);
    });

    it('deve lançar NotFoundException se fornecedor não existe', async () => {
      mockPrismaService.supplier.findUnique.mockResolvedValue(null);

      await expect(service.findOne('sup-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateSupplierDto = {
      name: 'Fornecedor Atualizado',
      email: 'novo@test.com',
    };

    it('deve atualizar um fornecedor com sucesso', async () => {
      const existingSupplier = {
        id: 'sup-1',
        name: 'Fornecedor Original',
      };
      const updatedSupplier = {
        ...existingSupplier,
        ...updateSupplierDto,
      };

      mockPrismaService.supplier.findUnique
        .mockResolvedValueOnce(existingSupplier) // findOne check
        .mockResolvedValueOnce(null); // email check
      mockPrismaService.supplier.update.mockResolvedValue(updatedSupplier);

      const result = await service.update('sup-1', updateSupplierDto);

      expect(result).toEqual(updatedSupplier);
      expect(mockPrismaService.supplier.update).toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se fornecedor não existe', async () => {
      mockPrismaService.supplier.findUnique.mockResolvedValue(null);

      await expect(
        service.update('sup-999', updateSupplierDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ConflictException se email duplicado', async () => {
      const existingSupplier = { id: 'sup-1', name: 'Fornecedor' };
      const updateWithEmail = { email: 'duplicado@test.com' };

      mockPrismaService.supplier.findUnique
        .mockResolvedValueOnce(existingSupplier)
        .mockResolvedValueOnce({ id: 'sup-2', email: 'duplicado@test.com' });

      await expect(service.update('sup-1', updateWithEmail)).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve lançar ConflictException se CNPJ duplicado', async () => {
      const existingSupplier = { id: 'sup-1', name: 'Fornecedor' };
      const updateWithCnpj = { cnpj: '12345678000190' };

      mockPrismaService.supplier.findUnique
        .mockResolvedValueOnce(existingSupplier)
        .mockResolvedValueOnce({ id: 'sup-2', cnpj: '12345678000190' });

      await expect(service.update('sup-1', updateWithCnpj)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('deve remover um fornecedor sem produtos', async () => {
      const mockSupplier = {
        id: 'sup-1',
        name: 'Fornecedor Teste',
      };

      mockPrismaService.supplier.findUnique.mockResolvedValue(mockSupplier);
      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.supplier.delete.mockResolvedValue(mockSupplier);

      const result = await service.remove('sup-1');

      expect(result).toEqual({ message: 'Fornecedor removido com sucesso' });
      expect(mockPrismaService.supplier.delete).toHaveBeenCalled();
    });

    it('deve lançar ConflictException se fornecedor tem produtos', async () => {
      const mockSupplier = {
        id: 'sup-1',
        name: 'Fornecedor Teste',
      };

      mockPrismaService.supplier.findUnique.mockResolvedValue(mockSupplier);
      mockPrismaService.product.count.mockResolvedValue(3);

      await expect(service.remove('sup-1')).rejects.toThrow(ConflictException);
      expect(mockPrismaService.supplier.delete).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se fornecedor não existe', async () => {
      mockPrismaService.supplier.findUnique.mockResolvedValue(null);

      await expect(service.remove('sup-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
