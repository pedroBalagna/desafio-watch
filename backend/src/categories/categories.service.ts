import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      this.logger.warn(
        `Tentativa de criar categoria duplicada: ${createCategoryDto.name}`,
        'CategoriesService',
      );
      throw new ConflictException('Categoria com este nome já existe');
    }

    const category = await this.prisma.category.create({
      data: createCategoryDto,
    });

    this.logger.log(`Categoria criada: ${category.name}`, 'CategoriesService');
    return category;
  }

  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };

    const categories = await this.prisma.category.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    this.logger.log(
      `Listando ${categories.length} categorias`,
      'CategoriesService',
    );
    return categories;
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          where: { isActive: true },
          select: {
            id: true,
            sku: true,
            name: true,
            currentStock: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      this.logger.warn(`Categoria não encontrada: ${id}`, 'CategoriesService');
      throw new NotFoundException(`Categoria com ID ${id} não encontrada`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);

    if (updateCategoryDto.name) {
      const existingCategory = await this.prisma.category.findUnique({
        where: { name: updateCategoryDto.name },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException('Categoria com este nome já existe');
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });

    this.logger.log(
      `Categoria atualizada: ${category.name}`,
      'CategoriesService',
    );
    return category;
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    // Verificar se existem produtos associados
    const productsCount = await this.prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      throw new ConflictException(
        `Não é possível excluir. Existem ${productsCount} produtos associados a esta categoria.`,
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    this.logger.log(
      `Categoria removida: ${category.name}`,
      'CategoriesService',
    );
    return { message: 'Categoria removida com sucesso' };
  }
}
