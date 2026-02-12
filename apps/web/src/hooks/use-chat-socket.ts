import type { ChatMessage, ChunkMetadata } from "@/lib/types"
import { getSocket } from "@/lib/ws"
import { useCallback, useEffect, useRef, useState } from "react"
import type { Socket } from "socket.io-client"
import { useChatStore } from "@/stores/chat-store"

function generateId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function useChatSocket() {
  const socketRef = useRef<Socket | null>(null)
  const currentAssistantIdRef = useRef<string | null>(null)
  
  const {
    messages,
    isStreaming,
    error,
    addMessage,
    updateLastMessage,
    completeLastMessage,
    setStreaming,
    setError,
    clearMessages: clearStoreMessages,
    setMessages,
  } = useChatStore()

  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Initialize socket connection
    const socket = getSocket()
    socketRef.current = socket

    // Connection handlers
    socket.on("connect", () => {
      console.log("✅ WebSocket connected")
      setIsConnected(true)
      setError(null)
    })

    socket.on("disconnect", () => {
      console.log("❌ WebSocket disconnected")
      setIsConnected(false)
    })

    socket.on("connect_error", (err) => {
      console.error("WebSocket connection error:", err)
      setError("Failed to connect to chat server")
      setIsConnected(false)
    })

    // Chat event handlers
    socket.on("chat:token", (data: { token: string; conversationId: string; messageId: string }) => {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg && lastMsg.role === "assistant" && lastMsg.isStreaming) {
        updateLastMessage(lastMsg.content + data.token)
      }
    })

    socket.on("chat:done", (data: { conversationId: string; messageId: string; sources: ChunkMetadata[] }) => {
      console.log("✅ Chat completed with sources:", data.sources)
      completeLastMessage(data.sources)
      currentAssistantIdRef.current = null
    })

    socket.on("chat:error", (data: { conversationId: string; error: string }) => {
      console.error("❌ Chat error:", data.error)
      setError(data.error)
      updateLastMessage("Sorry, an error occurred. Please try again.")
      completeLastMessage()
      currentAssistantIdRef.current = null
    })

    socket.on("chat:pong", () => {
      console.log("🏓 Pong received")
    })

    // Cleanup on unmount
    return () => {
      socket.off("connect")
      socket.off("disconnect")
      socket.off("connect_error")
      socket.off("chat:token")
      socket.off("chat:done")
      socket.off("chat:error")
      socket.off("chat:pong")
    }
  }, [messages, updateLastMessage, completeLastMessage, setError])

  const sendMessage = useCallback(
    async (content: string, conversationId: string = "default") => {
      if (!content.trim() || isStreaming || !socketRef.current?.connected) {
        if (!socketRef.current?.connected) {
          setError("Not connected to chat server")
        }
        return
      }

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

      currentAssistantIdRef.current = assistantMessage.id
      addMessage(userMessage)
      addMessage(assistantMessage)
      setStreaming(true)

      // Get language preference from store
      const language = useChatStore.getState().language

      // Send message via WebSocket
      socketRef.current.emit("chat:send", {
        message: content.trim(),
        conversationId,
        language,
      })
    },
    [isStreaming, addMessage, setStreaming, setError]
  )

  const stopStreaming = useCallback(() => {
    completeLastMessage()
    currentAssistantIdRef.current = null
  }, [completeLastMessage])

  const clearMessages = useCallback(() => {
    clearStoreMessages()
  }, [clearStoreMessages])

  const setInitialMessages = useCallback((msgs: ChatMessage[]) => {
    setMessages(msgs)
  }, [setMessages])

  const ping = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("chat:ping")
    }
  }, [])

  return {
    messages,
    isStreaming,
    isConnected,
    error,
    sendMessage,
    stopStreaming,
    clearMessages,
    setInitialMessages,
    ping,
  }
}
