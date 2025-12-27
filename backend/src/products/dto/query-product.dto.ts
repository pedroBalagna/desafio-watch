import {
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum StockStatus {
  ALL = 'all',
  LOW = 'low',
  OUT = 'out',
  NORMAL = 'normal',
}

export class QueryProductDto {
  @ApiPropertyOptional({
    description: 'Busca por nome ou SKU',
    example: 'notebook',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por categoria',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por fornecedor',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsOptional()
  supplierId?: string;

  @ApiPropertyOptional({
    description: 'Incluir produtos inativos',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeInactive?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por status de estoque',
    enum: StockStatus,
    example: StockStatus.LOW,
  })
  @IsEnum(StockStatus)
  @IsOptional()
  stockStatus?: StockStatus;

  @ApiPropertyOptional({
    description: 'Página atual',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Quantidade por página',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 20)
  limit?: number;
}
