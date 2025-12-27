import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { KafkaService } from './kafka.service';

@ApiTags('kafka')
@Controller('kafka')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class KafkaController {
  constructor(private readonly kafkaService: KafkaService) {}

  @Get('status')
  @ApiOperation({ summary: 'Verificar status da conexão Kafka' })
  @ApiResponse({ status: 200, description: 'Status do Kafka' })
  getStatus() {
    return this.kafkaService.getStatus();
  }
}
