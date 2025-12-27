import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto, StockStatus } from './dto/query-product.dto';
import { LoggerService } from '../common/logger/logger.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    // Verificar SKU duplicado
    const existingBySku = await this.prisma.product.findUnique({
      where: { sku: createProductDto.sku },
    });
    if (existingBySku) {
      throw new ConflictException('Produto com este SKU já existe');
    }

    // Verificar código de barras duplicado
    if (createProductDto.barcode) {
      const existingByBarcode = await this.prisma.product.findUnique({
        where: { barcode: createProductDto.barcode },
      });
      if (existingByBarcode) {
        throw new ConflictException(
          'Produto com este código de barras já existe',
        );
      }
    }

    // Verificar se categoria existe
    if (createProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: createProductDto.categoryId },
      });
      if (!category) {
        throw new BadRequestException('Categoria não encontrada');
      }
    }

    // Verificar se fornecedor existe
    if (createProductDto.supplierId) {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id: createProductDto.supplierId },
      });
      if (!supplier) {
        throw new BadRequestException('Fornecedor não encontrado');
      }
    }

    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        unitPrice: new Prisma.Decimal(createProductDto.unitPrice),
        costPrice: new Prisma.Decimal(createProductDto.costPrice),
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    this.logger.log(`Produto criado: ${product.name}`, 'ProductsService');
    return product;
  }

  async findAll(query: QueryProductDto) {
    const {
      search,
      categoryId,
      supplierId,
      includeInactive = false,
      stockStatus = StockStatus.ALL,
      page = 1,
      limit = 20,
    } = query;

    const where: Prisma.ProductWhereInput = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    // Filtrar por status de estoque
    if (stockStatus === StockStatus.LOW) {
      where.AND = [
        { currentStock: { gt: 0 } },
        {
          currentStock: { lte: this.prisma.$queryRaw`"minStock"` as any },
        },
      ];
      // Usando raw query para comparar currentStock com minStock
    } else if (stockStatus === StockStatus.OUT) {
      where.currentStock = 0;
    } else if (stockStatus === StockStatus.NORMAL) {
      where.currentStock = { gt: 0 };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true },
          },
          supplier: {
            select: { id: true, name: true },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    // Adicionar flag de estoque baixo
    const productsWithFlags = products.map((product) => ({
      ...product,
      isLowStock: product.currentStock <= product.minStock,
      isOutOfStock: product.currentStock === 0,
    }));

    this.logger.log(
      `Listando ${products.length} de ${total} produtos`,
      'ProductsService',
    );

    return {
      data: productsWithFlags,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        stockLevels: {
          include: {
            warehouse: {
              select: { id: true, name: true, code: true },
            },
          },
        },
        stockMovements: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            warehouse: {
              select: { id: true, name: true, code: true },
            },
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!product) {
      this.logger.warn(`Produto não encontrado: ${id}`, 'ProductsService');
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    return {
      ...product,
      isLowStock: product.currentStock <= product.minStock,
      isOutOfStock: product.currentStock === 0,
    };
  }

  async findBySku(sku: string) {
    const product = await this.prisma.product.findUnique({
      where: { sku },
      include: {
        category: true,
        supplier: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Produto com SKU ${sku} não encontrado`);
    }

    return product;
  }

  async findByBarcode(barcode: string) {
    const product = await this.prisma.product.findUnique({
      where: { barcode },
      include: {
        category: true,
        supplier: true,
      },
    });

    if (!product) {
      throw new NotFoundException(
        `Produto com código de barras ${barcode} não encontrado`,
      );
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    // Verificar SKU duplicado
    if (updateProductDto.sku) {
      const existingBySku = await this.prisma.product.findUnique({
        where: { sku: updateProductDto.sku },
      });
      if (existingBySku && existingBySku.id !== id) {
        throw new ConflictException('Produto com este SKU já existe');
      }
    }

    // Verificar código de barras duplicado
    if (updateProductDto.barcode) {
      const existingByBarcode = await this.prisma.product.findUnique({
        where: { barcode: updateProductDto.barcode },
      });
      if (existingByBarcode && existingByBarcode.id !== id) {
        throw new ConflictException(
          'Produto com este código de barras já existe',
        );
      }
    }

    // Verificar se categoria existe
    if (updateProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });
      if (!category) {
        throw new BadRequestException('Categoria não encontrada');
      }
    }

    // Verificar se fornecedor existe
    if (updateProductDto.supplierId) {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id: updateProductDto.supplierId },
      });
      if (!supplier) {
        throw new BadRequestException('Fornecedor não encontrado');
      }
    }

    const data: Prisma.ProductUpdateInput = { ...updateProductDto };
    if (updateProductDto.unitPrice !== undefined) {
      data.unitPrice = new Prisma.Decimal(updateProductDto.unitPrice);
    }
    if (updateProductDto.costPrice !== undefined) {
      data.costPrice = new Prisma.Decimal(updateProductDto.costPrice);
    }

    const product = await this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        supplier: true,
      },
    });

    this.logger.log(`Produto atualizado: ${product.name}`, 'ProductsService');
    return product;
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    // Verificar se existem movimentações de estoque
    const movementsCount = await this.prisma.stockMovement.count({
      where: { productId: id },
    });

    if (movementsCount > 0) {
      // Em vez de excluir, desativar
      await this.prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      this.logger.log(
        `Produto desativado (possui histórico): ${product.name}`,
        'ProductsService',
      );
      return {
        message:
          'Produto desativado com sucesso (possui histórico de movimentações)',
      };
    }

    await this.prisma.product.delete({
      where: { id },
    });

    this.logger.log(`Produto removido: ${product.name}`, 'ProductsService');
    return { message: 'Produto removido com sucesso' };
  }

  async getLowStockProducts() {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { currentStock: 0 },
          {
            currentStock: {
              lte: this.prisma.product.fields.minStock as any,
            },
          },
        ],
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
        supplier: {
          select: { id: true, name: true },
        },
      },
      orderBy: { currentStock: 'asc' },
    });

    // Filtrar produtos com estoque baixo
    const lowStockProducts = products.filter(
      (p) => p.currentStock <= p.minStock,
    );

    return lowStockProducts.map((product) => ({
      ...product,
      isLowStock:
        product.currentStock <= product.minStock && product.currentStock > 0,
      isOutOfStock: product.currentStock === 0,
      deficit: product.minStock - product.currentStock,
    }));
  }
}
