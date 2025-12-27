import { IsOptional, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { MovementType } from './create-stock-movement.dto';

export class QueryMovementDto {
  @ApiPropertyOptional({
    description: 'Filtrar por produto',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por armazém',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsOptional()
  warehouseId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de movimentação',
    enum: MovementType,
  })
  @IsEnum(MovementType)
  @IsOptional()
  type?: MovementType;

  @ApiPropertyOptional({
    description: 'Data inicial',
    example: '2024-01-01',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Data final',
    example: '2024-12-31',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

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
