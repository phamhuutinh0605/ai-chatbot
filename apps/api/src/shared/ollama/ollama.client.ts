import { Injectable } from '@nestjs/common';

export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    num_predict?: number;
  };
}

export interface OllamaGenerateResponse {
  model: string;
  response: string;
  done: boolean;
}

export interface OllamaEmbedRequest {
  model: string;
  prompt: string;
}

export interface OllamaEmbedResponse {
  embedding: number[];
}

@Injectable()
export class OllamaClient {
  private baseUrl: string = process.env.OLLAMA_URL || 'http://localhost:11434';
  private chatModel: string = process.env.OLLAMA_CHAT_MODEL || 'llama3';
  private embedModel: string = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';

  async embed(text: string, model?: string): Promise<number[]> {
    const payload: OllamaEmbedRequest = {
      model: model || this.embedModel,
      prompt: text,
    };

    const res = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Ollama embedding failed: ${res.statusText}`);
    }

    const data: OllamaEmbedResponse = await res.json();
    return data.embedding;
  }

  async *generateStream(prompt: string, model?: string): AsyncGenerator<string> {
    const payload: OllamaGenerateRequest = {
      model: model || this.chatModel,
      prompt,
      stream: true,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 1024,
      },
    };

    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Ollama stream failed: ${res.statusText}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed: OllamaGenerateResponse = JSON.parse(line);
          if (parsed.response) {
            yield parsed.response;
          }
          if (parsed.done) return;
        } catch {
          // skip malformed JSON
        }
      }
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`);
      return res.ok;
    } catch {
      return false;
    }
  }
}
