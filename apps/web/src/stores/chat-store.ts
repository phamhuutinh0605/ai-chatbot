import { create } from "zustand"
import type { ChatMessage } from "@/lib/types"

interface ChatStore {
  messages: ChatMessage[]
  isStreaming: boolean
  error: string | null
  addMessage: (message: ChatMessage) => void
  updateLastMessage: (content: string) => void
  completeLastMessage: (sources?: any[]) => void
  setStreaming: (streaming: boolean) => void
  setError: (error: string | null) => void
  clearMessages: () => void
  setMessages: (messages: ChatMessage[]) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  error: null,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateLastMessage: (content) =>
    set((state) => ({
      messages: state.messages.map((msg, idx) =>
        idx === state.messages.length - 1
          ? { ...msg, content }
          : msg
      ),
    })),

  completeLastMessage: (sources) =>
    set((state) => ({
      messages: state.messages.map((msg, idx) =>
        idx === state.messages.length - 1
          ? { ...msg, isStreaming: false, sources }
          : msg
      ),
      isStreaming: false,
    })),

  setStreaming: (streaming) =>
    set({ isStreaming: streaming }),

  setError: (error) =>
    set({ error }),

  clearMessages: () =>
    set({ messages: [], error: null }),

  setMessages: (messages) =>
    set({ messages }),
}))
