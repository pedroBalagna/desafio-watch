import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUST = 'ADJUST',
  TRANSFER = 'TRANSFER',
  RETURN = 'RETURN',
  DAMAGE = 'DAMAGE',
}

export class CreateStockMovementDto {
  @ApiProperty({
    description: 'Tipo de movimentação',
    enum: MovementType,
    example: MovementType.IN,
  })
  @IsEnum(MovementType)
  @IsNotEmpty()
  type: MovementType;

  @ApiProperty({
    description: 'ID do produto',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'ID do armazém',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsNotEmpty()
  warehouseId: string;

  @ApiProperty({
    description: 'Quantidade movimentada',
    example: 10,
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Preço unitário (para entradas)',
    example: 99.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Type(() => Number)
  unitPrice?: number;

  @ApiPropertyOptional({
    description: 'Referência (NF, pedido, etc.)',
    example: 'NF-12345',
  })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional({
    description: 'Observações',
    example: 'Entrada de mercadoria do fornecedor XYZ',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
