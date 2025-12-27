import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(
            ({ timestamp, level, message, context, ...meta }) => {
              return `${timestamp} [${context}] ${level}: ${message} ${
                Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
              }`;
            },
          ),
        ),
      }),
    ];

    // Configurar Elasticsearch se as variáveis estiverem definidas
    const elasticsearchNode =
      this.configService.get<string>('ELASTICSEARCH_NODE');
    const elasticsearchIndex =
      this.configService.get<string>('ELASTICSEARCH_INDEX') ||
      'desafio-watch-logs';
    const elasticsearchUsername = this.configService.get<string>(
      'ELASTICSEARCH_USERNAME',
    );
    const elasticsearchPassword = this.configService.get<string>(
      'ELASTICSEARCH_PASSWORD',
    );

    if (elasticsearchNode) {
      const esTransportOpts: any = {
        level: 'info',
        ensureIndexTemplate: true,
        clientOpts: {
          node: elasticsearchNode,
          ...(elasticsearchUsername && elasticsearchPassword
            ? {
                auth: {
                  username: elasticsearchUsername,
                  password: elasticsearchPassword,
                },
              }
            : {}),
        },
        index: elasticsearchIndex,
        indexTemplate: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
          },
          mappings: {
            properties: {
              '@timestamp': { type: 'date' },
              level: { type: 'keyword' },
              message: { type: 'text' },
              context: { type: 'keyword' },
            },
          },
        },
        transformer: (logData: any) => {
          return {
            '@timestamp': new Date().toISOString(),
            level: logData.level,
            message: logData.message,
            context: logData.context || 'Application',
            ...logData.meta,
          };
        },
      };

      try {
        transports.push(new ElasticsearchTransport(esTransportOpts));
      } catch (error) {
        console.error('Erro ao configurar Elasticsearch transport:', error);
      }
    }

    this.logger = winston.createLogger({
      level: this.configService.get<string>('LOG_LEVEL') || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports,
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
