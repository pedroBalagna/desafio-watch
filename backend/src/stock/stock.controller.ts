import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { StockService } from './stock.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { QueryMovementDto } from './dto/query-movement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('stock')
@Controller('stock')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Obter dashboard de estoque' })
  @ApiResponse({ status: 200, description: 'Dashboard de estoque' })
  getDashboard() {
    return this.stockService.getDashboard();
  }

  @Post('movement')
  @ApiOperation({
    summary: 'Registrar movimentação de estoque (entrada/saída)',
  })
  @ApiResponse({
    status: 201,
    description: 'Movimentação registrada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou estoque insuficiente',
  })
  @ApiResponse({
    status: 404,
    description: 'Produto ou armazém não encontrado',
  })
  createMovement(
    @Body() createStockMovementDto: CreateStockMovementDto,
    @Request() req: any,
  ) {
    return this.stockService.createMovement(
      createStockMovementDto,
      req.user.id,
    );
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transferir estoque entre armazéns' })
  @ApiResponse({
    status: 201,
    description: 'Transferência realizada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou estoque insuficiente',
  })
  @ApiResponse({
    status: 404,
    description: 'Produto ou armazém não encontrado',
  })
  transfer(@Body() transferStockDto: TransferStockDto, @Request() req: any) {
    return this.stockService.transfer(transferStockDto, req.user.id);
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Ajustar estoque (inventário)' })
  @ApiResponse({ status: 201, description: 'Ajuste realizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({
    status: 404,
    description: 'Produto ou armazém não encontrado',
  })
  adjust(@Body() adjustStockDto: AdjustStockDto, @Request() req: any) {
    return this.stockService.adjust(adjustStockDto, req.user.id);
  }

  @Get('movements')
  @ApiOperation({ summary: 'Listar movimentações de estoque com filtros' })
  @ApiResponse({ status: 200, description: 'Lista de movimentações paginada' })
  findAllMovements(@Query() query: QueryMovementDto) {
    return this.stockService.findAllMovements(query);
  }

  @Get('movements/:id')
  @ApiOperation({ summary: 'Obter detalhes de uma movimentação' })
  @ApiParam({ name: 'id', description: 'ID da movimentação (UUID)' })
  @ApiResponse({ status: 200, description: 'Detalhes da movimentação' })
  @ApiResponse({ status: 404, description: 'Movimentação não encontrada' })
  getMovement(@Param('id', ParseUUIDPipe) id: string) {
    return this.stockService.getMovementById(id);
  }
}
