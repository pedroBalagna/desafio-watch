import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoggerService } from '../common/logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

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

    // Preparar dados para atualização, convertendo strings vazias em null
    const dataToUpdate: any = {};

    if (updateWarehouseDto.name !== undefined) {
      dataToUpdate.name = updateWarehouseDto.name;
    }
    if (updateWarehouseDto.code !== undefined) {
      dataToUpdate.code = updateWarehouseDto.code;
    }
    if (updateWarehouseDto.address !== undefined) {
      dataToUpdate.address =
        updateWarehouseDto.address && updateWarehouseDto.address.trim()
          ? updateWarehouseDto.address.trim()
          : null;
    }
    if (updateWarehouseDto.city !== undefined) {
      dataToUpdate.city =
        updateWarehouseDto.city && updateWarehouseDto.city.trim()
          ? updateWarehouseDto.city.trim()
          : null;
    }
    if (updateWarehouseDto.state !== undefined) {
      dataToUpdate.state =
        updateWarehouseDto.state && updateWarehouseDto.state.trim()
          ? updateWarehouseDto.state.trim()
          : null;
    }
    if (updateWarehouseDto.zipCode !== undefined) {
      dataToUpdate.zipCode =
        updateWarehouseDto.zipCode && updateWarehouseDto.zipCode.trim()
          ? updateWarehouseDto.zipCode.trim()
          : null;
    }
    if (updateWarehouseDto.description !== undefined) {
      dataToUpdate.description =
        updateWarehouseDto.description && updateWarehouseDto.description.trim()
          ? updateWarehouseDto.description.trim()
          : null;
    }
    if (updateWarehouseDto.isActive !== undefined) {
      dataToUpdate.isActive = updateWarehouseDto.isActive;
    }

    try {
      const warehouse = await this.prisma.warehouse.update({
        where: { id },
        data: dataToUpdate,
      });

      this.logger.log(
        `Armazém atualizado: ${warehouse.name}`,
        'WarehousesService',
      );
      return warehouse;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Erro ao atualizar armazém ${id}: ${errorMessage}`,
        'WarehousesService',
      );

      if (errorStack) {
        this.logger.error(`Stack trace: ${errorStack}`, 'WarehousesService');
      }

      // Re-throw exceções do NestJS
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      // Se o erro for do Prisma, logar código do erro
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        'meta' in error
      ) {
        this.logger.error(
          `Erro Prisma - Código: ${(error as any).code}, Meta: ${JSON.stringify((error as any).meta)}`,
          'WarehousesService',
        );
      }

      throw error;
    }
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
