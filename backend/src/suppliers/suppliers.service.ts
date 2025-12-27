import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class SuppliersService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  async create(createSupplierDto: CreateSupplierDto) {
    // Verificar email duplicado
    if (createSupplierDto.email) {
      const existingByEmail = await this.prisma.supplier.findUnique({
        where: { email: createSupplierDto.email },
      });
      if (existingByEmail) {
        throw new ConflictException('Fornecedor com este email já existe');
      }
    }

    // Verificar CNPJ duplicado
    if (createSupplierDto.cnpj) {
      const existingByCnpj = await this.prisma.supplier.findUnique({
        where: { cnpj: createSupplierDto.cnpj },
      });
      if (existingByCnpj) {
        throw new ConflictException('Fornecedor com este CNPJ já existe');
      }
    }

    const supplier = await this.prisma.supplier.create({
      data: createSupplierDto,
    });

    this.logger.log(`Fornecedor criado: ${supplier.name}`, 'SuppliersService');
    return supplier;
  }

  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };

    const suppliers = await this.prisma.supplier.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    this.logger.log(
      `Listando ${suppliers.length} fornecedores`,
      'SuppliersService',
    );
    return suppliers;
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
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

    if (!supplier) {
      this.logger.warn(`Fornecedor não encontrado: ${id}`, 'SuppliersService');
      throw new NotFoundException(`Fornecedor com ID ${id} não encontrado`);
    }

    return supplier;
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    await this.findOne(id);

    // Verificar email duplicado
    if (updateSupplierDto.email) {
      const existingByEmail = await this.prisma.supplier.findUnique({
        where: { email: updateSupplierDto.email },
      });
      if (existingByEmail && existingByEmail.id !== id) {
        throw new ConflictException('Fornecedor com este email já existe');
      }
    }

    // Verificar CNPJ duplicado
    if (updateSupplierDto.cnpj) {
      const existingByCnpj = await this.prisma.supplier.findUnique({
        where: { cnpj: updateSupplierDto.cnpj },
      });
      if (existingByCnpj && existingByCnpj.id !== id) {
        throw new ConflictException('Fornecedor com este CNPJ já existe');
      }
    }

    const supplier = await this.prisma.supplier.update({
      where: { id },
      data: updateSupplierDto,
    });

    this.logger.log(
      `Fornecedor atualizado: ${supplier.name}`,
      'SuppliersService',
    );
    return supplier;
  }

  async remove(id: string) {
    const supplier = await this.findOne(id);

    // Verificar se existem produtos associados
    const productsCount = await this.prisma.product.count({
      where: { supplierId: id },
    });

    if (productsCount > 0) {
      throw new ConflictException(
        `Não é possível excluir. Existem ${productsCount} produtos associados a este fornecedor.`,
      );
    }

    await this.prisma.supplier.delete({
      where: { id },
    });

    this.logger.log(
      `Fornecedor removido: ${supplier.name}`,
      'SuppliersService',
    );
    return { message: 'Fornecedor removido com sucesso' };
  }
}
