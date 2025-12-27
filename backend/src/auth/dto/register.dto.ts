import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'usuario@example.com',
    description: 'Email do usuário',
  })
  @IsEmail({}, { message: 'Email deve ser válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({ example: 'João Silva', description: 'Nome do usuário' })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha do usuário',
    minLength: 6,
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  password: string;
}
