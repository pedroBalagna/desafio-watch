import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Verificar se o email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      this.logger.warn(
        `Tentativa de criar usuário com email duplicado: ${createUserDto.email}`,
        'UsersService',
      );
      throw new ConflictException('Email já está em uso');
    }

    const user = await this.prisma.user.create({
      data: createUserDto,
    });

    this.logger.log(`Usuário criado: ${user.email}`, 'UsersService');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Listando ${users.length} usuários`, 'UsersService');
    return users;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      this.logger.warn(`Usuário não encontrado: ${id}`, 'UsersService');
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Verificar se o usuário existe
    await this.findOne(id);

    // Se estiver atualizando o email, verificar se não está duplicado
    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        this.logger.warn(
          `Tentativa de atualizar email para um já existente: ${updateUserDto.email}`,
          'UsersService',
        );
        throw new ConflictException('Email já está em uso');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    this.logger.log(`Usuário atualizado: ${user.email}`, 'UsersService');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async remove(id: string) {
    // Verificar se o usuário existe
    const user = await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });

    this.logger.log(`Usuário removido: ${user.email}`, 'UsersService');
    return { message: 'Usuário removido com sucesso' };
  }
}
