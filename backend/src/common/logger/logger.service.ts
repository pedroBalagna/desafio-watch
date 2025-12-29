import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { trace as otelTrace } from '@opentelemetry/api';
import * as winston from 'winston';

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
    const activeSpan = otelTrace.getActiveSpan();
    const spanContext = activeSpan?.spanContext();

    this.logger.info(message, {
      context,
      traceId: spanContext?.traceId,
      spanId: spanContext?.spanId,
    });

    // Adicionar evento ao span do OpenTelemetry
    if (activeSpan) {
      activeSpan.addEvent(message, {
        context,
        level: 'info',
      });
    }
  }

  error(message: string, trace?: string, context?: string) {
    const activeSpan = otelTrace.getActiveSpan();
    const spanContext = activeSpan?.spanContext();

    this.logger.error(message, {
      trace,
      context,
      traceId: spanContext?.traceId,
      spanId: spanContext?.spanId,
    });

    // Adicionar evento de erro ao span do OpenTelemetry
    if (activeSpan) {
      activeSpan.recordException(new Error(message));
      activeSpan.setStatus({ code: 2, message }); // ERROR status
    }
  }

  warn(message: string, context?: string) {
    const activeSpan = otelTrace.getActiveSpan();
    const spanContext = activeSpan?.spanContext();

    this.logger.warn(message, {
      context,
      traceId: spanContext?.traceId,
      spanId: spanContext?.spanId,
    });

    // Adicionar evento ao span do OpenTelemetry
    if (activeSpan) {
      activeSpan.addEvent(message, {
        context,
        level: 'warn',
      });
    }
  }

  debug(message: string, context?: string) {
    const activeSpan = otelTrace.getActiveSpan();
    const spanContext = activeSpan?.spanContext();

    this.logger.debug(message, {
      context,
      traceId: spanContext?.traceId,
      spanId: spanContext?.spanId,
    });

    // Adicionar evento ao span do OpenTelemetry
    if (activeSpan) {
      activeSpan.addEvent(message, {
        context,
        level: 'debug',
      });
    }
  }

  verbose(message: string, context?: string) {
    const activeSpan = otelTrace.getActiveSpan();
    const spanContext = activeSpan?.spanContext();

    this.logger.verbose(message, {
      context,
      traceId: spanContext?.traceId,
      spanId: spanContext?.spanId,
    });

    // Adicionar evento ao span do OpenTelemetry
    if (activeSpan) {
      activeSpan.addEvent(message, {
        context,
        level: 'verbose',
      });
    }
  }
}
