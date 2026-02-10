import { Injectable } from '@nestjs/common';
import { ChromaService, VectorSearchResult, ChunkMetadata, DocumentChunk } from '../vector/chroma.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { RAG_CONSTANTS } from '../../constants/rag.constants';

export interface RAGPrompt {
  system: string;
  context: string;
  question: string;
  fullPrompt: string;
}

@Injectable()
export class RagService {
  constructor(
    private readonly chromaService: ChromaService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  chunkText(
    text: string,
    source: string,
    chunkSize = RAG_CONSTANTS.CHUNK_SIZE,
    chunkOverlap = RAG_CONSTANTS.CHUNK_OVERLAP,
  ): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const paragraphs = text.split(/\n\s*\n/);
    let currentChunk = '';
    let currentSection = '';
    let chunkIndex = 0;

    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;

      const headerMatch = trimmed.match(/^#{1,3}\s+(.+)$/);
      if (headerMatch) {
        currentSection = headerMatch[1].trim();
      }

      if (currentChunk.length + trimmed.length > chunkSize && currentChunk.length > 0) {
        chunks.push(this.createChunk(currentChunk, source, currentSection, chunkIndex));
        chunkIndex++;

        const words = currentChunk.split(/\s+/);
        const overlapWords = words.slice(-Math.floor(chunkOverlap / 4));
        currentChunk = overlapWords.join(' ') + '\n\n' + trimmed;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + trimmed;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(this.createChunk(currentChunk, source, currentSection, chunkIndex));
    }

    return chunks;
  }

  private createChunk(content: string, source: string, section: string, index: number): DocumentChunk {
    const metadata: ChunkMetadata = {
      source,
      chunkIndex: index,
    };
    if (section) {
      metadata.section = section;
    }

    return {
      id: `${source}-chunk-${index}`,
      content: content.trim(),
      metadata,
    };
  }

  buildRAGPrompt(question: string, chunks: VectorSearchResult[]): RAGPrompt {
    const contextParts = chunks.map((chunk, i) => {
      const sourceInfo = chunk.metadata.section
        ? `[Source: ${chunk.metadata.source} - ${chunk.metadata.section}]`
        : `[Source: ${chunk.metadata.source}]`;
      return `--- Context ${i + 1} ${sourceInfo} ---\n${chunk.document}`;
    });

    const contextStr = contextParts.join('\n\n');

    const fullPrompt = `${RAG_CONSTANTS.SYSTEM_PROMPT}

Context:
${contextStr}

Question: ${question}

Answer:`;

    return {
      system: RAG_CONSTANTS.SYSTEM_PROMPT,
      context: contextStr,
      question,
      fullPrompt,
    };
  }

  async retrieveContext(
    query: string,
    topK = RAG_CONSTANTS.TOP_K,
  ): Promise<VectorSearchResult[]> {
    const embedding = await this.embeddingService.generateEmbedding(query);
    return this.chromaService.query(embedding, topK);
  }
}
