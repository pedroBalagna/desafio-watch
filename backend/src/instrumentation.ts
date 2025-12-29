/**
 * OpenTelemetry Instrumentation
 *
 * IMPORTANTE: Este arquivo deve ser importado ANTES de qualquer outro código.
 * As instrumentações do OpenTelemetry precisam ser registradas antes de
 * qualquer módulo HTTP/Fastify ser carregado.
 */

import { FastifyOtelInstrumentation } from '@fastify/otel';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

const enableTelemetry = process.env.ENABLE_TELEMETRY !== 'false';

if (enableTelemetry) {
  const otlpEndpoint = process.env.OTLP_ENDPOINT || 'http://localhost:4318';
  const serviceName = process.env.SERVICE_NAME || 'desafio-watch-backend';
  const serviceVersion = process.env.SERVICE_VERSION || '1.0.0';
  const environment = process.env.NODE_ENV || 'development';

  console.log(`[OpenTelemetry] Inicializando instrumentacao...`);
  console.log(`[OpenTelemetry] Service: ${serviceName}`);
  console.log(`[OpenTelemetry] Endpoint: ${otlpEndpoint}`);

  // Criar resource com informacoes do servico
  const resource = defaultResource().merge(
    resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_VERSION]: serviceVersion,
      'deployment.environment': environment,
    }),
  );

  // Criar trace exporter
  const traceExporter = new OTLPTraceExporter({
    url: `${otlpEndpoint}/v1/traces`,
  });

  // Criar e registrar o TracerProvider ANTES de tudo
  const tracerProvider = new NodeTracerProvider({
    resource: resource,
    spanProcessors: [new BatchSpanProcessor(traceExporter)],
  });

  // Registrar o provider globalmente
  tracerProvider.register();

  // Registrar instrumentacoes DEPOIS do provider
  registerInstrumentations({
    tracerProvider: tracerProvider,
    instrumentations: [
      new HttpInstrumentation(),
      new FastifyOtelInstrumentation(),
    ],
  });

  console.log(`[OpenTelemetry] Instrumentacao registrada com sucesso!`);

  // Graceful shutdown
  process.on('SIGTERM', () => {
    tracerProvider
      .shutdown()
      .then(() => console.log('[OpenTelemetry] TracerProvider finalizado'))
      .catch((err) => console.error('[OpenTelemetry] Erro ao finalizar:', err));
  });
} else {
  console.log('[OpenTelemetry] Desabilitado (ENABLE_TELEMETRY=false)');
}

export {};
