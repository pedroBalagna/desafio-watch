import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggerService } from '../src/common/logger/logger.service';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let cachedApp: NestFastifyApplication;

async function createApp(): Promise<NestFastifyApplication> {
  if (cachedApp) {
    return cachedApp;
  }

  const adapter = new FastifyAdapter({
    logger: false,
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    {
      bufferLogs: true,
    },
  );

  // Usar logger customizado
  app.useLogger(app.get(LoggerService));

  // Habilitar CORS
  const cors = await import('@fastify/cors');
  await app.register(cors.default, {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://frontend-watch.vercel.app',
      process.env.FRONTEND_URL || '*',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Desafio Watch API')
    .setDescription('API REST para desafio técnico Watch - Fullstack PL/SR')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  cachedApp = app;

  return app;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const app = await createApp();
  const fastifyInstance = app.getHttpAdapter().getInstance();

  // Converter Vercel request para formato Fastify
  const url = req.url || '/';

  // Criar request object compatível com Fastify
  const fastifyReq = {
    method: req.method || 'GET',
    url,
    headers: req.headers || {},
    query: req.query || {},
    body: req.body,
    raw: req,
    ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '',
    hostname: req.headers.host || '',
    protocol: req.headers['x-forwarded-proto'] || 'https',
  } as any;

  // Criar response object compatível com Fastify
  let statusCode = 200;
  const headers: Record<string, string> = {};

  const fastifyRes = {
    statusCode,
    headers,
    setHeader: (name: string, value: string) => {
      headers[name] = value;
      res.setHeader(name, value);
    },
    getHeader: (name: string) => headers[name] || res.getHeader(name),
    removeHeader: (name: string) => {
      delete headers[name];
      res.removeHeader(name);
    },
    write: (chunk: any) => {
      res.write(chunk);
    },
    end: (chunk?: any) => {
      if (chunk) {
        res.write(chunk);
      }
      res.end();
    },
    send: (payload: any) => {
      if (typeof payload === 'object') {
        res.setHeader('Content-Type', 'application/json');
        res.status(statusCode);
        res.end(JSON.stringify(payload));
      } else {
        res.status(statusCode);
        res.end(payload);
      }
    },
    code: (code: number) => {
      statusCode = code;
      res.statusCode = code;
      return fastifyRes;
    },
    header: (name: string, value: string) => {
      headers[name] = value;
      res.setHeader(name, value);
      return fastifyRes;
    },
    raw: res,
  } as any;

  // Executar a rota no Fastify
  try {
    await fastifyInstance.routing(fastifyReq, fastifyRes);
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
