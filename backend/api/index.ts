import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express, { Express, Request, Response } from 'express';
import { AppModule } from '../src/app.module';
import { LoggerService } from '../src/common/logger/logger.service';

let cachedApp: Express | null = null;

async function createApp(): Promise<Express> {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);

  const app = await NestFactory.create(AppModule, adapter, {
    bufferLogs: true,
  });

  // Logger
  try {
    app.useLogger(app.get(LoggerService));
  } catch {
    // Logger não disponível, continua sem
  }

  // CORS - Configuração dinâmica
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://front-desafio-watch.vercel.app',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      const normalizedOrigin = origin.replace(/\/$/, '');
      if (
        allowedOrigins.some(
          (allowed) =>
            normalizedOrigin === allowed ||
            normalizedOrigin.startsWith(allowed),
        )
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
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
  cachedApp = expressApp;

  return expressApp;
}

export default async function handler(req: Request, res: Response) {
  const app = await createApp();
  app(req, res);
}
