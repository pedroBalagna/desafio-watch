import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka, logLevel, Partitioners, Producer } from 'kafkajs';
import { LoggerService } from '../common/logger/logger.service';

export interface StockMovementEvent {
  type: string;
  productId: string;
  productSku: string;
  productName: string;
  warehouseId: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  userId: string;
  timestamp: string;
}

export interface LowStockAlertEvent {
  productId: string;
  productSku: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  currentStock: number;
  minStock: number;
  timestamp: string;
}

export interface StockTransferEvent {
  productId: string;
  productSku: string;
  productName: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  quantity: number;
  userId: string;
  timestamp: string;
}

// Tópicos Kafka
export const KAFKA_TOPICS = {
  STOCK_MOVEMENT: 'stock.movement',
  LOW_STOCK_ALERT: 'stock.low-alert',
  STOCK_TRANSFER: 'stock.transfer',
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
};

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka | null = null;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;
  private isConnected = false;
  private isEnabled = false;

  constructor(
    private configService: ConfigService,
    private logger: LoggerService,
  ) {}

  async onModuleInit() {
    const brokers = this.configService.get<string>('KAFKA_BROKERS');

    if (!brokers) {
      this.logger.warn(
        'KAFKA_BROKERS não configurado. Kafka desabilitado.',
        'KafkaService',
      );
      return;
    }

    this.isEnabled = true;

    try {
      this.kafka = new Kafka({
        clientId: this.configService.get('KAFKA_CLIENT_ID', 'inventory-api'),
        brokers: brokers.split(','),
        ssl: this.configService.get('KAFKA_SSL', 'false') === 'true',
        sasl: this.getSaslConfig(),
        logLevel: logLevel.WARN,
        retry: {
          initialRetryTime: 100,
          retries: 3,
        },
      });

      this.producer = this.kafka.producer({
        createPartitioner: Partitioners.LegacyPartitioner,
      });

      await this.producer.connect();
      this.isConnected = true;

      this.logger.log('Kafka Producer conectado com sucesso', 'KafkaService');
    } catch (error) {
      this.logger.error(
        `Erro ao conectar Kafka: ${error.message}`,
        error.stack,
        'KafkaService',
      );
      this.isConnected = false;
    }
  }

  async onModuleDestroy() {
    try {
      if (this.producer) {
        await this.producer.disconnect();
      }
      if (this.consumer) {
        await this.consumer.disconnect();
      }
      this.logger.log('Kafka desconectado', 'KafkaService');
    } catch (error) {
      this.logger.error(
        `Erro ao desconectar Kafka: ${error.message}`,
        error.stack,
        'KafkaService',
      );
    }
  }

  private getSaslConfig():
    | { mechanism: 'plain'; username: string; password: string }
    | { mechanism: 'scram-sha-256'; username: string; password: string }
    | { mechanism: 'scram-sha-512'; username: string; password: string }
    | undefined {
    const mechanism = this.configService.get<string>('KAFKA_SASL_MECHANISM');
    const username = this.configService.get<string>('KAFKA_SASL_USERNAME');
    const password = this.configService.get<string>('KAFKA_SASL_PASSWORD');

    if (!mechanism || !username || !password) {
      return undefined;
    }

    switch (mechanism) {
      case 'plain':
        return {
          mechanism: 'plain' as const,
          username,
          password,
        };
      case 'scram-sha-256':
        return {
          mechanism: 'scram-sha-256' as const,
          username,
          password,
        };
      case 'scram-sha-512':
        return {
          mechanism: 'scram-sha-512' as const,
          username,
          password,
        };
      default:
        return undefined;
    }
  }

  private async publish(topic: string, message: any, key?: string) {
    if (!this.isEnabled) {
      this.logger.debug(
        `Kafka desabilitado. Mensagem ignorada: ${topic}`,
        'KafkaService',
      );
      return;
    }

    if (!this.isConnected || !this.producer) {
      this.logger.warn(
        `Kafka não conectado. Mensagem não enviada: ${topic}`,
        'KafkaService',
      );
      return;
    }

    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: key || undefined,
            value: JSON.stringify(message),
            headers: {
              'content-type': 'application/json',
              timestamp: new Date().toISOString(),
            },
          },
        ],
      });

      this.logger.debug(
        `Mensagem publicada no tópico ${topic}`,
        'KafkaService',
      );
    } catch (error) {
      this.logger.error(
        `Erro ao publicar mensagem no Kafka: ${error.message}`,
        error.stack,
        'KafkaService',
      );
    }
  }

  // === PRODUTORES ===

  async publishStockMovement(event: StockMovementEvent) {
    await this.publish(KAFKA_TOPICS.STOCK_MOVEMENT, event, event.productId);
  }

  async publishLowStockAlert(event: LowStockAlertEvent) {
    await this.publish(KAFKA_TOPICS.LOW_STOCK_ALERT, event, event.productId);

    this.logger.warn(
      `ALERTA: Estoque baixo - ${event.productName} (${event.currentStock}/${event.minStock})`,
      'KafkaService',
    );
  }

  async publishStockTransfer(event: StockTransferEvent) {
    await this.publish(KAFKA_TOPICS.STOCK_TRANSFER, event, event.productId);
  }

  async publishProductCreated(product: any) {
    await this.publish(KAFKA_TOPICS.PRODUCT_CREATED, product, product.id);
  }

  async publishProductUpdated(product: any) {
    await this.publish(KAFKA_TOPICS.PRODUCT_UPDATED, product, product.id);
  }

  // === CONSUMIDORES ===

  async startConsumer(
    groupId: string,
    topics: string[],
    handler: (topic: string, message: any) => Promise<void>,
  ) {
    if (!this.isEnabled || !this.kafka) {
      this.logger.warn(
        'Kafka não habilitado. Consumer não iniciado.',
        'KafkaService',
      );
      return;
    }

    try {
      this.consumer = this.kafka.consumer({ groupId });
      await this.consumer.connect();

      for (const topic of topics) {
        await this.consumer.subscribe({ topic, fromBeginning: false });
      }

      await this.consumer.run({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const value = message.value?.toString();
            if (value) {
              const parsedMessage = JSON.parse(value);
              await handler(topic, parsedMessage);
            }
          } catch (error) {
            this.logger.error(
              `Erro ao processar mensagem: ${error.message}`,
              error.stack,
              'KafkaService',
            );
          }
        },
      });

      this.logger.log(
        `Consumer iniciado para tópicos: ${topics.join(', ')}`,
        'KafkaService',
      );
    } catch (error) {
      this.logger.error(
        `Erro ao iniciar consumer: ${error.message}`,
        error.stack,
        'KafkaService',
      );
    }
  }

  // Método para verificar status
  getStatus() {
    return {
      enabled: this.isEnabled,
      connected: this.isConnected,
      topics: KAFKA_TOPICS,
    };
  }
}
