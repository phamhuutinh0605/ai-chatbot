"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Bot, User, SendHorizonal, Square, Sparkles, FileText } from "lucide-react"
import { useChatSocket } from "@/hooks/use-chat-socket"
import type { ChatMessage, Conversation } from "@/lib/types"

interface WidgetChatProps {
  initialConversation?: Conversation | null
  onSaveConversation?: (conversation: Conversation) => void
}

export function WidgetChat({ initialConversation, onSaveConversation }: WidgetChatProps) {
  const { messages, isStreaming, isConnected, error, sendMessage, stopStreaming, clearMessages, setInitialMessages } =
    useChatSocket()
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const conversationIdRef = useRef<string>(
    initialConversation?.id ?? `conv-${Date.now()}`
  )

  // Load initial conversation
  useEffect(() => {
    if (initialConversation?.messages) {
      setInitialMessages(initialConversation.messages)
    }
  }, [initialConversation, setInitialMessages])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Save conversation when messages change
  useEffect(() => {
    if (messages.length > 0 && !isStreaming && onSaveConversation) {
      const firstUserMsg = messages.find((m) => m.role === "user")
      onSaveConversation({
        id: conversationIdRef.current,
        title: firstUserMsg?.content.slice(0, 50) ?? "New conversation",
        messages,
        createdAt: initialConversation?.createdAt ?? messages[0].timestamp,
        updatedAt: Date.now(),
      })
    }
  }, [messages, isStreaming, onSaveConversation, initialConversation?.createdAt])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = "auto"
      el.style.height = `${Math.min(el.scrollHeight, 100)}px`
    }
  }, [input])

  const handleSubmit = () => {
    if (isStreaming && stopStreaming) {
      stopStreaming()
      return
    }
    if (!input.trim()) return
    sendMessage(input)
    setInput("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSuggestion = useCallback(
    (text: string) => {
      sendMessage(text)
    },
    [sendMessage]
  )

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
        {messages.length === 0 ? (
          <WidgetEmptyState onSuggestion={handleSuggestion} />
        ) : (
          <div className="px-4 py-3 space-y-4">
            {messages.map((msg) => (
              <WidgetBubble key={msg.id} message={msg} />
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-3 mb-2 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-border bg-card p-3">
        <div className="flex items-end gap-2 rounded-xl border border-border bg-background p-1.5 focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-primary/50 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about policies..."
            rows={1}
            className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground min-h-[32px] max-h-[100px]"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isStreaming && !input.trim()}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors disabled:opacity-40",
              isStreaming
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {isStreaming ? (
              <Square className="h-3.5 w-3.5" />
            ) : (
              <SendHorizonal className="h-3.5 w-3.5" />
            )}
            <span className="sr-only">
              {isStreaming ? "Stop" : "Send"}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

function WidgetEmptyState({ onSuggestion }: { onSuggestion: (text: string) => void }) {
  const suggestions = [
    "What is the annual leave policy?",
    "How is salary structured?",
    "Password requirements?",
    "New employee onboarding?",
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
        <Bot className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-sm font-semibold text-foreground text-balance text-center">
        Shinhan AI Assistant
      </h3>
      <p className="mt-1.5 text-xs text-muted-foreground text-center leading-relaxed max-w-[260px]">
        Ask questions about company policies, HR guidelines, and more.
      </p>

      <div className="mt-5 w-full space-y-1.5">
        <p className="text-[10px] font-medium text-muted-foreground flex items-center justify-center gap-1">
          <Sparkles className="h-3 w-3" />
          Suggestions
        </p>
        {suggestions.map((text) => (
          <button
            key={text}
            type="button"
            onClick={() => onSuggestion(text)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-left text-xs text-foreground transition-colors hover:bg-accent hover:border-primary/30"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}

function WidgetBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-2.5 animate-fade-in", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>

      <div className={cn("flex max-w-[78%] flex-col gap-1", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-[13px] leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted text-foreground rounded-bl-sm"
          )}
        >
          {message.isStreaming && !message.content ? (
            <div className="flex items-center gap-1 py-0.5 px-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse-dot" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse-dot animate-pulse-dot-delay-1" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse-dot animate-pulse-dot-delay-2" />
            </div>
          ) : (
            <WidgetMessageContent content={message.content} />
          )}
          {message.isStreaming && message.content && (
            <span className="inline-block w-1 h-3.5 bg-primary ml-0.5 animate-blink align-text-bottom" />
          )}
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {message.sources.map((source, i) => (
              <span
                key={`${source.source}-${i}`}
                className="inline-flex items-center gap-0.5 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground"
              >
                <FileText className="h-2.5 w-2.5" />
                {source.source}
              </span>
            ))}
          </div>
        )}

        <span className="text-[9px] text-muted-foreground px-1">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  )
}

function WidgetMessageContent({ content }: { content: string }) {
  const lines = content.split("\n")

  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={i} className="h-0.5" />

        if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
          return (
            <p key={i} className="font-semibold text-xs">
              {trimmed.slice(2, -2)}
            </p>
          )
        }

        if (trimmed.startsWith("- ")) {
          return (
            <div key={i} className="flex gap-1.5 pl-1 text-[12px]">
              <span className="text-muted-foreground shrink-0">{"•"}</span>
              <span
                dangerouslySetInnerHTML={{
                  __html: trimmed
                    .slice(2)
                    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>'),
                }}
              />
            </div>
          )
        }

        if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
          if (trimmed.match(/^\|[\s-|]+\|$/)) return null
          const cells = trimmed
            .split("|")
            .filter((c) => c.trim())
            .map((c) => c.trim())
          const isHeader = i + 1 < lines.length && lines[i + 1]?.trim().match(/^\|[\s-|]+\|$/)

          return (
            <div
              key={i}
              className={cn(
                "grid gap-1 text-[10px]",
                isHeader ? "font-semibold border-b border-border pb-1" : ""
              )}
              style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}
            >
              {cells.map((cell, j) => (
                <span key={j}>{cell}</span>
              ))}
            </div>
          )
        }

        return (
          <p
            key={i}
            className="text-[12px]"
            dangerouslySetInnerHTML={{
              __html: trimmed.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>'),
            }}
          />
        )
      })}
    </div>
  )
}
