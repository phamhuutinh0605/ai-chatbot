"use client"

import { useEffect, useCallback } from "react"
import { ChatMessages } from "./chat-messages"
import { ChatInput } from "./chat-input"
import { useChatSocket } from "@/hooks/use-chat-socket"

export function ChatPanel() {
  const { messages, isStreaming, isConnected, error, sendMessage, stopStreaming, clearMessages } =
    useChatSocket()

  // Listen for suggestion clicks from the empty state
  const handleSuggestionClick = useCallback(
    (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.text) {
        sendMessage(detail.text)
      }
    },
    [sendMessage]
  )

  useEffect(() => {
    window.addEventListener("suggestion-click", handleSuggestionClick)
    return () => {
      window.removeEventListener("suggestion-click", handleSuggestionClick)
    }
  }, [handleSuggestionClick])

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div>
          <h1 className="text-base font-semibold text-foreground">
            AI Knowledge Assistant
          </h1>
          <p className="text-xs text-muted-foreground">
            Ask questions about Shinhan DS policies and guidelines
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearMessages}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-accent"
          >
            Clear chat
          </button>
        )}
      </header>

      {/* Messages */}
      <ChatMessages messages={messages} />

      {/* Error display */}
      {error && (
        <div className="mx-auto max-w-3xl px-4 pb-2">
          <div className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        onStop={stopStreaming}
        isStreaming={isStreaming}
      />
    </div>
  )
}
