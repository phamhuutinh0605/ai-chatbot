import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { ChatModule } from './modules/chat/chat.module';
import { EmbeddingModule } from './modules/embedding/embedding.module';
import { VectorModule } from './modules/vector/vector.module';
import { RagModule } from './modules/rag/rag.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { DocumentModule } from './modules/document/document.module';
import { HealthModule } from './modules/health/health.module';

import authConfig from './config/auth.config';
import ollamaConfig from './config/ollama.config';
import chromaConfig from './config/chroma.config';

import { JwtAccessTokenGuard } from './guards/jwt-access-token.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [authConfig, ollamaConfig, chromaConfig],
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    UserModule,
    HealthModule,
    ChatModule,
    EmbeddingModule,
    VectorModule,
    RagModule,
    DocumentModule,
  ],
  // providers: [
  //   {
  //     provide: APP_GUARD,
  //     useClass: JwtAccessTokenGuard,
  //   },
  // ],
})
export class AppModule {}
