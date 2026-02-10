"use client"

import { useState, useCallback, useRef } from "react"
import type { ChatMessage, ChunkMetadata, Conversation } from "@/lib/types"

function generateId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return

    setError(null)

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: content.trim(),
      timestamp: Date.now(),
    }

    // Create assistant placeholder
    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      isStreaming: true,
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setIsStreaming(true)

    try {
      abortControllerRef.current = new AbortController()

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content.trim(),
          conversationId: "default",
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!res.ok) throw new Error("Chat request failed")

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      let buffer = ""
      let fullContent = ""
      let sources: ChunkMetadata[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith("data: ")) continue

          try {
            const parsed = JSON.parse(trimmed.slice(6))

            if (parsed.type === "token") {
              fullContent += parsed.data
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessage.id
                    ? { ...msg, content: fullContent }
                    : msg
                )
              )
            }

            if (parsed.type === "sources") {
              sources = parsed.data
            }

            if (parsed.type === "done") {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessage.id
                    ? {
                        ...msg,
                        content: fullContent,
                        isStreaming: false,
                        sources,
                      }
                    : msg
                )
              )
            }
          } catch {
            // skip malformed SSE data
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return

      const errorMessage =
        err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: "Sorry, an error occurred. Please try again.",
                isStreaming: false,
              }
            : msg
        )
      )
    } finally {
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }, [isStreaming])

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort()
    setIsStreaming(false)
    setMessages((prev) =>
      prev.map((msg) =>
        msg.isStreaming ? { ...msg, isStreaming: false } : msg
      )
    )
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  const setInitialMessages = useCallback((msgs: ChatMessage[]) => {
    setMessages(msgs)
  }, [])

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
    clearMessages,
    setInitialMessages,
  }
}
