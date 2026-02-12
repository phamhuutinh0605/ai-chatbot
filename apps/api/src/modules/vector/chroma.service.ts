import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChromaClient } from 'chromadb';

export interface ChunkMetadata {
  source: string;
  section?: string;
  chunkIndex?: number;
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: ChunkMetadata;
}

export interface VectorSearchResult {
  id: string;
  document: string;
  metadata: ChunkMetadata;
  score: number;
}

@Injectable()
export class ChromaService implements OnModuleInit {
  private client: ChromaClient;
  private collection: any;
  private collectionName: string = 'shinhan-knowledge-base';

  async onModuleInit() {
    await this.init();
  }

  async init(): Promise<void> {
    try {
      const host = process.env.CHROMA_URL || 'http://localhost:8000';
      this.client = new ChromaClient({ path: host });

      // Get or create collection
      this.collection = await this.client.getOrCreateCollection({
        name: this.collectionName,
        metadata: { 'hnsw:space': 'cosine' },
      });

      console.log('✅ ChromaDB collection ready:', this.collectionName);
    } catch (error) {
      console.error('❌ ChromaService init failed:', error);
    }
  }

  async addDocuments(
    chunks: DocumentChunk[],
    embeddings: number[][],
  ): Promise<void> {
    if (!this.collection) await this.init();

    try {
      await this.collection.add({
        ids: chunks.map((c) => c.id),
        documents: chunks.map((c) => c.content),
        embeddings,
        metadatas: chunks.map((c) => c.metadata),
      });

      console.log(`✅ Added ${chunks.length} chunks to ChromaDB`);
    } catch (error) {
      console.error('❌ Failed to add documents:', error);
      throw error;
    }
  }

  async query(
    embedding: number[],
    topK: number = 4,
  ): Promise<VectorSearchResult[]> {
    if (!this.collection) await this.init();

    try {
      const results = await this.collection.query({
        queryEmbeddings: [embedding],
        nResults: topK,
        include: ['documents', 'metadatas', 'distances'],
      });

      const output: VectorSearchResult[] = [];
      const ids = results.ids?.[0] ?? [];
      const docs = results.documents?.[0] ?? [];
      const metas = results.metadatas?.[0] ?? [];
      const distances = results.distances?.[0] ?? [];

      for (let i = 0; i < ids.length; i++) {
        output.push({
          id: ids[i],
          document: docs[i],
          metadata: metas[i] as ChunkMetadata,
          score: 1 - (distances[i] ?? 0),
        });
      }

      return output;
    } catch (error) {
      console.error('❌ Query failed:', error);
      return [];
    }
  }

  async count(): Promise<number> {
    if (!this.collection) await this.init();

    try {
      const result = await this.collection.count();
      return result ?? 0;
    } catch (error) {
      console.error('❌ Count error:', error);
      return 0;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.heartbeat();
      return true;
    } catch {
      return false;
    }
  }
}
