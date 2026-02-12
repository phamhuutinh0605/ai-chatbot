import { Injectable } from '@nestjs/common';
import { RagService, RAGPrompt } from '../rag/rag.service';
import { VectorSearchResult } from '../vector/chroma.service';
import { OllamaClient } from '@/shared/ollama/ollama.client';

@Injectable()
export class ChatService {
  constructor(
    private readonly ragService: RagService,
    private readonly ollamaClient: OllamaClient,
  ) {}

  async retrieveContext(query: string): Promise<VectorSearchResult[]> {
    return this.ragService.retrieveContext(query);
  }

  buildPrompt(question: string, context: VectorSearchResult[], language = 'auto'): string {
    const ragPrompt: RAGPrompt = this.ragService.buildRAGPrompt(question, context, language);
    return ragPrompt.fullPrompt;
  }

  async *generateStream(prompt: string): AsyncGenerator<string> {
    yield* this.ollamaClient.generateStream(prompt);
  }
}
