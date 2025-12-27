import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class WarehousesService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  async create(createWarehouseDto: CreateWarehouseDto) {
    // Verificar nome duplicado
    const existingByName = await this.prisma.warehouse.findUnique({
      where: { name: createWarehouseDto.name },
    });
    if (existingByName) {
      throw new ConflictException('Armazém com este nome já existe');
    }

    // Verificar código duplicado
    const existingByCode = await this.prisma.warehouse.findUnique({
      where: { code: createWarehouseDto.code },
    });
    if (existingByCode) {
      throw new ConflictException('Armazém com este código já existe');
    }

    const warehouse = await this.prisma.warehouse.create({
      data: createWarehouseDto,
    });

    this.logger.log(`Armazém criado: ${warehouse.name}`, 'WarehousesService');
    return warehouse;
  }

  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };

    const warehouses = await this.prisma.warehouse.findMany({
      where,
      include: {
        _count: {
          select: {
            stockLevels: true,
            stockMovements: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    this.logger.log(
      `Listando ${warehouses.length} armazéns`,
      'WarehousesService',
    );
    return warehouses;
  }

  async findOne(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        stockLevels: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
                unit: true,
                minStock: true,
              },
            },
          },
        },
        _count: {
          select: {
            stockLevels: true,
            stockMovements: true,
          },
        },
      },
    });

    if (!warehouse) {
      this.logger.warn(`Armazém não encontrado: ${id}`, 'WarehousesService');
      throw new NotFoundException(`Armazém com ID ${id} não encontrado`);
    }

    return warehouse;
  }

  async update(id: string, updateWarehouseDto: UpdateWarehouseDto) {
    await this.findOne(id);

    // Verificar nome duplicado
    if (updateWarehouseDto.name) {
      const existingByName = await this.prisma.warehouse.findUnique({
        where: { name: updateWarehouseDto.name },
      });
      if (existingByName && existingByName.id !== id) {
        throw new ConflictException('Armazém com este nome já existe');
      }
    }

    // Verificar código duplicado
    if (updateWarehouseDto.code) {
      const existingByCode = await this.prisma.warehouse.findUnique({
        where: { code: updateWarehouseDto.code },
      });
      if (existingByCode && existingByCode.id !== id) {
        throw new ConflictException('Armazém com este código já existe');
      }
    }

    const warehouse = await this.prisma.warehouse.update({
      where: { id },
      data: updateWarehouseDto,
    });

    this.logger.log(
      `Armazém atualizado: ${warehouse.name}`,
      'WarehousesService',
    );
    return warehouse;
  }

  async remove(id: string) {
    const warehouse = await this.findOne(id);

    // Verificar se existem movimentações
    const movementsCount = await this.prisma.stockMovement.count({
      where: { warehouseId: id },
    });

    if (movementsCount > 0) {
      // Desativar em vez de excluir
      await this.prisma.warehouse.update({
        where: { id },
        data: { isActive: false },
      });

      this.logger.log(
        `Armazém desativado (possui histórico): ${warehouse.name}`,
        'WarehousesService',
      );
      return {
        message:
          'Armazém desativado com sucesso (possui histórico de movimentações)',
      };
    }

    // Remover níveis de estoque associados
    await this.prisma.stockLevel.deleteMany({
      where: { warehouseId: id },
    });

    await this.prisma.warehouse.delete({
      where: { id },
    });

    this.logger.log(`Armazém removido: ${warehouse.name}`, 'WarehousesService');
    return { message: 'Armazém removido com sucesso' };
  }

  async getInventory(id: string) {
    const warehouse = await this.findOne(id);

    const inventory = await this.prisma.stockLevel.findMany({
      where: { warehouseId: id },
      include: {
        product: {
          include: {
            category: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: {
        product: {
          name: 'asc',
        },
      },
    });

    return {
      warehouse: {
        id: warehouse.id,
        name: warehouse.name,
        code: warehouse.code,
      },
      inventory: inventory.map((item) => ({
        ...item,
        isLowStock: item.quantity <= item.minStock && item.quantity > 0,
        isOutOfStock: item.quantity === 0,
      })),
      summary: {
        totalProducts: inventory.length,
        totalItems: inventory.reduce((acc, item) => acc + item.quantity, 0),
        lowStockProducts: inventory.filter(
          (item) => item.quantity <= item.minStock && item.quantity > 0,
        ).length,
        outOfStockProducts: inventory.filter((item) => item.quantity === 0)
          .length,
      },
    };
  }
}
