import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { OllamaClient } from '@/shared/ollama/ollama.client';
import { VectorModule } from '../vector/vector.module';

@Module({
  imports: [VectorModule],
  controllers: [HealthController],
  providers: [OllamaClient],
})
export class HealthModule {}
