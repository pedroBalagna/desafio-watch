import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AdjustStockDto {
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
    description: 'Nova quantidade (ajuste absoluto)',
    example: 50,
  })
  @IsNumber()
  @Type(() => Number)
  newQuantity: number;

  @ApiProperty({
    description: 'Motivo do ajuste',
    example: 'Inventário físico - divergência identificada',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Referência do ajuste',
    example: 'INV-2024-001',
  })
  @IsString()
  @IsOptional()
  reference?: string;
}
