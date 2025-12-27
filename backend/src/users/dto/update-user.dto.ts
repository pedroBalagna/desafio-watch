import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'usuario@example.com',
    description: 'Email do usuário',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email deve ser válido' })
  email?: string;

  @ApiProperty({
    example: 'João Silva',
    description: 'Nome do usuário',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  name?: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha do usuário',
    minLength: 6,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password?: string;
}
