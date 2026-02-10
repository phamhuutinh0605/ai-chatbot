import { Injectable } from '@nestjs/common';

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
export class ChromaService {
  private host: string = process.env.CHROMA_URL || 'http://localhost:8000';
  private collectionName: string = 'shinhan-knowledge-base';
  private collectionId: string | null = null;

  async init(): Promise<void> {
    try {
      const res = await fetch(`${this.host}/api/v1/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: this.collectionName,
          metadata: { 'hnsw:space': 'cosine' },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        this.collectionId = data.id;
      } else {
        const getRes = await fetch(
          `${this.host}/api/v1/collections/${this.collectionName}`,
        );
        if (getRes.ok) {
          const data = await getRes.json();
          this.collectionId = data.id;
        }
      }
    } catch (error) {
      console.error('ChromaService init failed:', error);
    }
  }

  async addDocuments(
    chunks: DocumentChunk[],
    embeddings: number[][],
  ): Promise<void> {
    if (!this.collectionId) await this.init();

    const ids = chunks.map((c) => c.id);
    const documents = chunks.map((c) => c.content);
    const metadatas = chunks.map((c) => c.metadata);

    await fetch(`${this.host}/api/v1/collections/${this.collectionId}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ids,
        documents,
        embeddings,
        metadatas,
      }),
    });
  }

  async query(
    embedding: number[],
    topK: number = 4,
  ): Promise<VectorSearchResult[]> {
    if (!this.collectionId) await this.init();

    const res = await fetch(
      `${this.host}/api/v1/collections/${this.collectionId}/query`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query_embeddings: [embedding],
          n_results: topK,
          include: ['documents', 'metadatas', 'distances'],
        }),
      },
    );

    if (!res.ok) return [];

    const data = await res.json();
    const results: VectorSearchResult[] = [];
    const ids = data.ids?.[0] ?? [];
    const docs = data.documents?.[0] ?? [];
    const metas = data.metadatas?.[0] ?? [];
    const distances = data.distances?.[0] ?? [];

    for (let i = 0; i < ids.length; i++) {
      results.push({
        id: ids[i],
        document: docs[i],
        metadata: metas[i] as ChunkMetadata,
        score: 1 - (distances[i] ?? 0),
      });
    }

    return results;
  }

  async count(): Promise<number> {
    if (!this.collectionId) await this.init();

    try {
      const res = await fetch(
        `${this.host}/api/v1/collections/${this.collectionId}/count`,
      );
      if (!res.ok) return 0;

      const data = await res.json();
      return data.count ?? 0;
    } catch {
      return 0;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.host}/api/v1/heartbeat`);
      return res.ok;
    } catch {
      return false;
    }
  }
}
