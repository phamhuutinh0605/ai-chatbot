import * as cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './middlewares/filters/all-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  // Set helmet
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: (origin, callback) => {
      console.log('🔥 CORS Request from:', origin);
      callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
    credentials: true,
  });

  // Rate limit
  app.use(
    rateLimit({
      windowMs: 5 * 60 * 1000,
      max: 300,
      message: 'Too many requests',
    }),
  );

  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      skipMissingProperties: false,
      skipNullProperties: false,
      skipUndefinedProperties: false,
    }),
  );

  app.useWebSocketAdapter(new IoAdapter(app));
  app.use(cookieParser());

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Shinhan Bank AI Chatbot API')
    .setDescription('RAG-powered chatbot API documentation')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey}_${methodKey}`,
  });
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
