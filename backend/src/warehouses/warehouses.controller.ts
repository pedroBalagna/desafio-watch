import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('warehouses')
@Controller('warehouses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo armazém' })
  @ApiResponse({ status: 201, description: 'Armazém criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Nome ou código já existe' })
  create(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this.warehousesService.create(createWarehouseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os armazéns' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Incluir armazéns inativos',
  })
  @ApiResponse({ status: 200, description: 'Lista de armazéns' })
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.warehousesService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter armazém por ID' })
  @ApiParam({ name: 'id', description: 'ID do armazém (UUID)' })
  @ApiResponse({ status: 200, description: 'Armazém encontrado' })
  @ApiResponse({ status: 404, description: 'Armazém não encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.warehousesService.findOne(id);
  }

  @Get(':id/inventory')
  @ApiOperation({ summary: 'Obter inventário do armazém' })
  @ApiParam({ name: 'id', description: 'ID do armazém (UUID)' })
  @ApiResponse({ status: 200, description: 'Inventário do armazém' })
  @ApiResponse({ status: 404, description: 'Armazém não encontrado' })
  getInventory(@Param('id', ParseUUIDPipe) id: string) {
    return this.warehousesService.getInventory(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar armazém' })
  @ApiParam({ name: 'id', description: 'ID do armazém (UUID)' })
  @ApiResponse({ status: 200, description: 'Armazém atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Armazém não encontrado' })
  @ApiResponse({ status: 409, description: 'Nome ou código já existe' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
  ) {
    return this.warehousesService.update(id, updateWarehouseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover ou desativar armazém' })
  @ApiParam({ name: 'id', description: 'ID do armazém (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Armazém removido/desativado com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Armazém não encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.warehousesService.remove(id);
  }
}
