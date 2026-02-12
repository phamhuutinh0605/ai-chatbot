// ============================================================
// packages/shared - Shared types & utilities
// ============================================================

// ---------- Chat Types ----------
export type MessageRole = "user" | "assistant" | "system"

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: number
  sources?: ChunkMetadata[]
  isStreaming?: boolean
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

// ---------- Document / Chunk Types ----------
export interface DocumentMeta {
  id: string
  filename: string
  type: "md" | "txt" | "pdf"
  size: number
  uploadedAt: number
  chunkCount: number
  status: "pending" | "indexing" | "indexed" | "error"
}

export interface ChunkMetadata {
  source: string
  section?: string
  chunkIndex?: number
}

export interface DocumentChunk {
  id: string
  content: string
  metadata: ChunkMetadata
  embedding?: number[]
}

// ---------- Vector Types ----------
export interface VectorRecord {
  id: string
  embedding: number[]
  document: string
  metadata: ChunkMetadata
}

export interface VectorSearchResult {
  id: string
  document: string
  metadata: ChunkMetadata
  score: number
}

// ---------- RAG Types ----------
export interface RAGContext {
  chunks: VectorSearchResult[]
  query: string
}

export interface RAGPrompt {
  system: string
  context: string
  question: string
  fullPrompt: string
}

// ---------- Ollama Types ----------
export interface OllamaGenerateRequest {
  model: string
  prompt: string
  stream: boolean
  options?: {
    temperature?: number
    top_p?: number
    top_k?: number
    num_predict?: number
  }
}

export interface OllamaGenerateResponse {
  model: string
  response: string
  done: boolean
}

export interface OllamaEmbedRequest {
  model: string
  prompt: string
}

export interface OllamaEmbedResponse {
  embedding: number[]
}

// ---------- WebSocket Events ----------
export interface WSChatSendPayload {
  message: string
  conversationId?: string
}

export interface WSChatTokenPayload {
  token: string
  conversationId: string
  messageId: string
}

export interface WSChatDonePayload {
  conversationId: string
  messageId: string
  sources: ChunkMetadata[]
}

export interface WSChatErrorPayload {
  conversationId: string
  error: string
}

// ---------- API Types ----------
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}
