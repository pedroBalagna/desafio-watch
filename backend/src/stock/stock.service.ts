import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { LoggerService } from '../common/logger/logger.service';
import { KafkaService } from '../kafka/kafka.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import {
  CreateStockMovementDto,
  MovementType,
} from './dto/create-stock-movement.dto';
import { QueryMovementDto } from './dto/query-movement.dto';
import { TransferStockDto } from './dto/transfer-stock.dto';

@Injectable()
export class StockService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private kafkaService: KafkaService,
  ) {}

  async createMovement(dto: CreateStockMovementDto, userId: string) {
    // Validar produto
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Validar armazém
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: dto.warehouseId },
    });
    if (!warehouse) {
      throw new NotFoundException('Armazém não encontrado');
    }

    // Obter ou criar nível de estoque para este produto neste armazém
    let stockLevel = await this.prisma.stockLevel.findUnique({
      where: {
        productId_warehouseId: {
          productId: dto.productId,
          warehouseId: dto.warehouseId,
        },
      },
    });

    if (!stockLevel) {
      stockLevel = await this.prisma.stockLevel.create({
        data: {
          productId: dto.productId,
          warehouseId: dto.warehouseId,
          quantity: 0,
          minStock: product.minStock,
          maxStock: product.maxStock,
        },
      });
    }

    const previousStock = stockLevel.quantity;
    let newStock: number;

    // Calcular novo estoque baseado no tipo de movimentação
    switch (dto.type) {
      case MovementType.IN:
      case MovementType.RETURN:
        newStock = previousStock + dto.quantity;
        break;
      case MovementType.OUT:
      case MovementType.DAMAGE:
        if (previousStock < dto.quantity) {
          throw new BadRequestException(
            `Estoque insuficiente. Disponível: ${previousStock}, Solicitado: ${dto.quantity}`,
          );
        }
        newStock = previousStock - dto.quantity;
        break;
      case MovementType.ADJUST:
        throw new BadRequestException(
          'Use o endpoint de ajuste de estoque para movimentações do tipo ADJUST',
        );
      case MovementType.TRANSFER:
        throw new BadRequestException(
          'Use o endpoint de transferência para movimentações do tipo TRANSFER',
        );
      default:
        throw new BadRequestException('Tipo de movimentação inválido');
    }

    // Criar movimentação e atualizar estoque em uma transação
    const [movement] = await this.prisma.$transaction([
      this.prisma.stockMovement.create({
        data: {
          type: dto.type,
          quantity: dto.quantity,
          unitPrice: dto.unitPrice ? new Prisma.Decimal(dto.unitPrice) : null,
          totalPrice: dto.unitPrice
            ? new Prisma.Decimal(dto.unitPrice * dto.quantity)
            : null,
          reference: dto.reference,
          notes: dto.notes,
          previousStock,
          newStock,
          productId: dto.productId,
          warehouseId: dto.warehouseId,
          userId,
        },
        include: {
          product: { select: { id: true, sku: true, name: true } },
          warehouse: { select: { id: true, code: true, name: true } },
          user: { select: { id: true, name: true } },
        },
      }),
      this.prisma.stockLevel.update({
        where: {
          productId_warehouseId: {
            productId: dto.productId,
            warehouseId: dto.warehouseId,
          },
        },
        data: { quantity: newStock },
      }),
      // Atualizar estoque global do produto
      this.prisma.product.update({
        where: { id: dto.productId },
        data: {
          currentStock: {
            increment:
              dto.type === MovementType.IN || dto.type === MovementType.RETURN
                ? dto.quantity
                : -dto.quantity,
          },
        },
      }),
    ]);

    this.logger.log(
      `Movimentação criada: ${dto.type} ${dto.quantity} ${product.name}`,
      'StockService',
    );

    // Publicar evento no Kafka
    await this.kafkaService.publishStockMovement({
      type: dto.type,
      productId: dto.productId,
      productSku: product.sku,
      productName: product.name,
      warehouseId: dto.warehouseId,
      quantity: dto.quantity,
      previousStock,
      newStock,
      userId,
      timestamp: new Date().toISOString(),
    });

    // Verificar estoque baixo
    if (newStock <= product.minStock) {
      await this.kafkaService.publishLowStockAlert({
        productId: dto.productId,
        productSku: product.sku,
        productName: product.name,
        warehouseId: dto.warehouseId,
        warehouseName: warehouse.name,
        currentStock: newStock,
        minStock: product.minStock,
        timestamp: new Date().toISOString(),
      });
    }

    return movement;
  }

  async transfer(dto: TransferStockDto, userId: string) {
    if (dto.fromWarehouseId === dto.toWarehouseId) {
      throw new BadRequestException(
        'Armazém de origem e destino devem ser diferentes',
      );
    }

    // Validar produto
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Validar armazéns
    const [fromWarehouse, toWarehouse] = await Promise.all([
      this.prisma.warehouse.findUnique({ where: { id: dto.fromWarehouseId } }),
      this.prisma.warehouse.findUnique({ where: { id: dto.toWarehouseId } }),
    ]);

    if (!fromWarehouse) {
      throw new NotFoundException('Armazém de origem não encontrado');
    }
    if (!toWarehouse) {
      throw new NotFoundException('Armazém de destino não encontrado');
    }

    // Verificar estoque no armazém de origem
    const fromStockLevel = await this.prisma.stockLevel.findUnique({
      where: {
        productId_warehouseId: {
          productId: dto.productId,
          warehouseId: dto.fromWarehouseId,
        },
      },
    });

    if (!fromStockLevel || fromStockLevel.quantity < dto.quantity) {
      throw new BadRequestException(
        `Estoque insuficiente no armazém de origem. Disponível: ${fromStockLevel?.quantity || 0}`,
      );
    }

    // Obter ou criar estoque no armazém de destino
    let toStockLevel = await this.prisma.stockLevel.findUnique({
      where: {
        productId_warehouseId: {
          productId: dto.productId,
          warehouseId: dto.toWarehouseId,
        },
      },
    });

    if (!toStockLevel) {
      toStockLevel = await this.prisma.stockLevel.create({
        data: {
          productId: dto.productId,
          warehouseId: dto.toWarehouseId,
          quantity: 0,
          minStock: product.minStock,
          maxStock: product.maxStock,
        },
      });
    }

    const fromPreviousStock = fromStockLevel.quantity;
    const toPreviousStock = toStockLevel.quantity;
    const fromNewStock = fromPreviousStock - dto.quantity;
    const toNewStock = toPreviousStock + dto.quantity;

    // Executar transferência em transação
    await this.prisma.$transaction([
      // Saída do armazém de origem
      this.prisma.stockMovement.create({
        data: {
          type: 'TRANSFER',
          quantity: dto.quantity,
          reference: dto.reference,
          notes: `Transferência para ${toWarehouse.name}. ${dto.notes || ''}`,
          previousStock: fromPreviousStock,
          newStock: fromNewStock,
          productId: dto.productId,
          warehouseId: dto.fromWarehouseId,
          userId,
        },
      }),
      // Entrada no armazém de destino
      this.prisma.stockMovement.create({
        data: {
          type: 'TRANSFER',
          quantity: dto.quantity,
          reference: dto.reference,
          notes: `Transferência de ${fromWarehouse.name}. ${dto.notes || ''}`,
          previousStock: toPreviousStock,
          newStock: toNewStock,
          productId: dto.productId,
          warehouseId: dto.toWarehouseId,
          userId,
        },
      }),
      // Atualizar estoque de origem
      this.prisma.stockLevel.update({
        where: {
          productId_warehouseId: {
            productId: dto.productId,
            warehouseId: dto.fromWarehouseId,
          },
        },
        data: { quantity: fromNewStock },
      }),
      // Atualizar estoque de destino
      this.prisma.stockLevel.update({
        where: {
          productId_warehouseId: {
            productId: dto.productId,
            warehouseId: dto.toWarehouseId,
          },
        },
        data: { quantity: toNewStock },
      }),
    ]);

    this.logger.log(
      `Transferência realizada: ${dto.quantity} ${product.name} de ${fromWarehouse.name} para ${toWarehouse.name}`,
      'StockService',
    );

    // Publicar evento no Kafka
    await this.kafkaService.publishStockTransfer({
      productId: dto.productId,
      productSku: product.sku,
      productName: product.name,
      fromWarehouseId: dto.fromWarehouseId,
      fromWarehouseName: fromWarehouse.name,
      toWarehouseId: dto.toWarehouseId,
      toWarehouseName: toWarehouse.name,
      quantity: dto.quantity,
      userId,
      timestamp: new Date().toISOString(),
    });

    return {
      message: 'Transferência realizada com sucesso',
      from: {
        warehouse: fromWarehouse.name,
        previousStock: fromPreviousStock,
        newStock: fromNewStock,
      },
      to: {
        warehouse: toWarehouse.name,
        previousStock: toPreviousStock,
        newStock: toNewStock,
      },
    };
  }

  async adjust(dto: AdjustStockDto, userId: string) {
    // Validar produto
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Validar armazém
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: dto.warehouseId },
    });
    if (!warehouse) {
      throw new NotFoundException('Armazém não encontrado');
    }

    // Obter ou criar nível de estoque
    let stockLevel = await this.prisma.stockLevel.findUnique({
      where: {
        productId_warehouseId: {
          productId: dto.productId,
          warehouseId: dto.warehouseId,
        },
      },
    });

    if (!stockLevel) {
      stockLevel = await this.prisma.stockLevel.create({
        data: {
          productId: dto.productId,
          warehouseId: dto.warehouseId,
          quantity: 0,
          minStock: product.minStock,
          maxStock: product.maxStock,
        },
      });
    }

    const previousStock = stockLevel.quantity;
    const difference = dto.newQuantity - previousStock;

    // Criar movimentação e atualizar estoque
    const [movement] = await this.prisma.$transaction([
      this.prisma.stockMovement.create({
        data: {
          type: 'ADJUST',
          quantity: Math.abs(difference),
          reference: dto.reference,
          notes: dto.reason,
          previousStock,
          newStock: dto.newQuantity,
          productId: dto.productId,
          warehouseId: dto.warehouseId,
          userId,
        },
        include: {
          product: { select: { id: true, sku: true, name: true } },
          warehouse: { select: { id: true, code: true, name: true } },
          user: { select: { id: true, name: true } },
        },
      }),
      this.prisma.stockLevel.update({
        where: {
          productId_warehouseId: {
            productId: dto.productId,
            warehouseId: dto.warehouseId,
          },
        },
        data: { quantity: dto.newQuantity },
      }),
      // Atualizar estoque global do produto
      this.prisma.product.update({
        where: { id: dto.productId },
        data: {
          currentStock: {
            increment: difference,
          },
        },
      }),
    ]);

    this.logger.log(
      `Ajuste de estoque: ${product.name} de ${previousStock} para ${dto.newQuantity}`,
      'StockService',
    );

    return movement;
  }

  async findAllMovements(query: QueryMovementDto) {
    const {
      productId,
      warehouseId,
      type,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = query;

    const where: Prisma.StockMovementWhereInput = {};

    if (productId) {
      where.productId = productId;
    }
    if (warehouseId) {
      where.warehouseId = warehouseId;
    }
    if (type) {
      where.type = type;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    const skip = (page - 1) * limit;

    const [movements, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        include: {
          product: { select: { id: true, sku: true, name: true } },
          warehouse: { select: { id: true, code: true, name: true } },
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return {
      data: movements,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMovementById(id: string) {
    const movement = await this.prisma.stockMovement.findUnique({
      where: { id },
      include: {
        product: true,
        warehouse: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!movement) {
      throw new NotFoundException('Movimentação não encontrada');
    }

    return movement;
  }

  async getDashboard() {
    const [
      totalProducts,
      activeProducts,
      ,
      ,
      totalWarehouses,
      recentMovements,
      movementsByType,
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.product.count({
        where: {
          isActive: true,
          currentStock: {
            gt: 0,
            lte: this.prisma.product.fields.minStock as any,
          },
        },
      }),
      this.prisma.product.count({
        where: { isActive: true, currentStock: 0 },
      }),
      this.prisma.warehouse.count({ where: { isActive: true } }),
      this.prisma.stockMovement.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { sku: true, name: true } },
          warehouse: { select: { code: true, name: true } },
        },
      }),
      this.prisma.stockMovement.groupBy({
        by: ['type'],
        _count: true,
      }),
    ]);

    // Calcular produtos com estoque baixo manualmente
    const allActiveProducts = await this.prisma.product.findMany({
      where: { isActive: true },
      select: { currentStock: true, minStock: true },
    });

    const lowStock = allActiveProducts.filter(
      (p) => p.currentStock > 0 && p.currentStock <= p.minStock,
    ).length;
    const outOfStock = allActiveProducts.filter(
      (p) => p.currentStock === 0,
    ).length;

    return {
      summary: {
        totalProducts,
        activeProducts,
        lowStockProducts: lowStock,
        outOfStockProducts: outOfStock,
        totalWarehouses,
      },
      movementsByType: movementsByType.reduce(
        (acc, item) => {
          acc[item.type] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      recentMovements,
    };
  }
}
