import { Module } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { OllamaClient } from '@/shared/ollama/ollama.client';

@Module({
  providers: [EmbeddingService, OllamaClient],
  exports: [EmbeddingService],
})
export class EmbeddingModule {}
