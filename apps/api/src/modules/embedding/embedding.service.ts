import { OllamaClient } from '@/shared/ollama/ollama.client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmbeddingService {
  constructor(private readonly ollamaClient: OllamaClient) {}

  async generateEmbedding(text: string): Promise<number[]> {
    return this.ollamaClient.embed(text);
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((text) => this.generateEmbedding(text)));
  }
}
