export const OLLAMA_CONFIG = {
  baseUrl: "http://localhost:11434",
  chatModel: "llama3",
  embedModel: "nomic-embed-text",
} as const

export const RAG_CONFIG = {
  chunkSize: 500,
  chunkOverlap: 75,
  topK: 4,
  systemPrompt:
    "You are a Shinhan DS AI assistant. Answer ONLY using the provided context. If the context does not contain enough information to answer, say so clearly. Be professional and concise.",
} as const

export const CHROMA_CONFIG = {
  collectionName: "shinhan-knowledge-base",
  host: "http://localhost:8000",
} as const