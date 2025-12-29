import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as opentelemetry from '@opentelemetry/api';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import {
  AggregationTemporality,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

/**
 * TelemetryService - Configuracao de metricas do OpenTelemetry
 *
 * NOTA: A instrumentacao de traces e feita em src/instrumentation.ts
 * que e carregado ANTES de qualquer outro codigo.
 * Este service apenas configura metricas adicionais.
 */
@Injectable()
export class TelemetryService implements OnModuleInit, OnModuleDestroy {
  private meterProvider: MeterProvider | null = null;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const enableTelemetry =
      this.configService.get<string>('ENABLE_TELEMETRY') !== 'false';

    if (!enableTelemetry) {
      return;
    }

    const otlpEndpoint =
      this.configService.get<string>('OTLP_ENDPOINT') ||
      'http://localhost:4318';
    const serviceName =
      this.configService.get<string>('SERVICE_NAME') || 'desafio-watch-backend';
    const serviceVersion =
      this.configService.get<string>('SERVICE_VERSION') || '1.0.0';
    const environment =
      this.configService.get<string>('NODE_ENV') || 'development';

    try {
      // Criar resource com informacoes do servico
      const resource = defaultResource().merge(
        resourceFromAttributes({
          [ATTR_SERVICE_NAME]: serviceName,
          [ATTR_SERVICE_VERSION]: serviceVersion,
          'deployment.environment': environment,
        }),
      );

      // ===== METRIC SETUP =====
      const metricExporter = new OTLPMetricExporter({
        url: `${otlpEndpoint}/v1/metrics`,
        temporalityPreference: AggregationTemporality.DELTA,
      });

      const metricReader = new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 3000,
      });

      this.meterProvider = new MeterProvider({
        resource: resource,
        readers: [metricReader],
      });

      // Definir o MeterProvider global
      opentelemetry.metrics.setGlobalMeterProvider(this.meterProvider);

      console.log('[TelemetryService] MeterProvider configurado');
    } catch (error) {
      console.error('[TelemetryService] Erro ao configurar metricas:', error);
    }
  }

  onModuleDestroy() {
    if (this.meterProvider) {
      this.meterProvider.shutdown();
      console.log('[TelemetryService] MeterProvider finalizado');
    }
  }
}
