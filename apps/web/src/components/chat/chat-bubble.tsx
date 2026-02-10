"use client"

import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/lib/types"
import { Bot, User, FileText } from "lucide-react"

interface ChatBubbleProps {
  message: ChatMessage
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-accent text-accent-foreground"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message content */}
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-card text-card-foreground border border-border rounded-bl-sm shadow-sm"
          )}
        >
          {message.isStreaming && !message.content ? (
            <TypingIndicator />
          ) : (
            <MessageContent content={message.content} />
          )}
          {message.isStreaming && message.content && (
            <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-blink align-text-bottom" />
          )}
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {message.sources.map((source, i) => (
              <span
                key={`${source.source}-${i}`}
                className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-medium text-accent-foreground"
              >
                <FileText className="h-3 w-3" />
                {source.source}
                {source.section && (
                  <span className="text-muted-foreground">
                    {"/ "}
                    {source.section}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground px-1">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1 px-1">
      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse-dot" />
      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse-dot animate-pulse-dot-delay-1" />
      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse-dot animate-pulse-dot-delay-2" />
    </div>
  )
}

function MessageContent({ content }: { content: string }) {
  // Simple markdown rendering for bold, tables, lists, and line breaks
  const lines = content.split("\n")

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const trimmed = line.trim()

        // Empty line
        if (!trimmed) return <div key={i} className="h-1" />

        // Bold lines (headers in markdown)
        if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
          return (
            <p key={i} className="font-semibold">
              {trimmed.slice(2, -2)}
            </p>
          )
        }

        // List items
        if (trimmed.startsWith("- ")) {
          return (
            <div key={i} className="flex gap-2 pl-2">
              <span className="text-muted-foreground shrink-0">{"•"}</span>
              <span
                // biome-ignore lint: simple markdown render
                dangerouslySetInnerHTML={{
                  __html: trimmed
                    .slice(2)
                    .replace(
                      /\*\*(.+?)\*\*/g,
                      '<strong class="font-semibold">$1</strong>'
                    ),
                }}
              />
            </div>
          )
        }

        // Table header detection
        if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
          // Skip separator rows
          if (trimmed.match(/^\|[\s-|]+\|$/)) return null

          const cells = trimmed
            .split("|")
            .filter((c) => c.trim())
            .map((c) => c.trim())

          const isHeader =
            i + 1 < lines.length &&
            lines[i + 1]?.trim().match(/^\|[\s-|]+\|$/)

          return (
            <div
              key={i}
              className={cn(
                "grid gap-2 text-xs",
                isHeader ? "font-semibold border-b border-border pb-1" : ""
              )}
              style={{
                gridTemplateColumns: `repeat(${cells.length}, 1fr)`,
              }}
            >
              {cells.map((cell, j) => (
                <span key={j}>{cell}</span>
              ))}
            </div>
          )
        }

        // Regular text with inline bold
        return (
          <p
            key={i}
            // biome-ignore lint: simple markdown render
            dangerouslySetInnerHTML={{
              __html: trimmed.replace(
                /\*\*(.+?)\*\*/g,
                '<strong class="font-semibold">$1</strong>'
              ),
            }}
          />
        )
      })}
    </div>
  )
}
