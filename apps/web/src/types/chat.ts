export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface ChunkMetadata {
  source: string;
  section?: string;
  chunkIndex?: number;
}

export interface WSChatSendPayload {
  message: string;
  conversationId?: string;
}

export interface WSChatTokenPayload {
  token: string;
  conversationId: string;
  messageId: string;
}

export interface WSChatDonePayload {
  conversationId: string;
  messageId: string;
  sources: ChunkMetadata[];
}

export interface WSChatErrorPayload {
  conversationId: string;
  error: string;
}
