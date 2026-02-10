import { Controller, Get } from '@nestjs/common';
import { IsPublic } from '@/decorators/is-public.decorator';
import { OllamaClient } from '@/shared/ollama/ollama.client';
import { ChromaService } from '../vector/chroma.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly ollamaClient: OllamaClient,
    private readonly chromaService: ChromaService,
  ) {}

  @IsPublic()
  @Get()
  async check() {
    const ollamaHealthy = await this.ollamaClient.healthCheck();
    const chromaHealthy = await this.chromaService.healthCheck();

    return {
      status: ollamaHealthy && chromaHealthy ? 'healthy' : 'degraded',
      services: {
        ollama: {
          status: ollamaHealthy ? 'up' : 'down',
          url: process.env.OLLAMA_URL || 'http://localhost:11434',
        },
        chroma: {
          status: chromaHealthy ? 'up' : 'down',
          url: process.env.CHROMA_URL || 'http://localhost:8000',
        },
      },
      timestamp: new Date().toISOString(),
    };
  }
}
