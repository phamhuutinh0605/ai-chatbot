"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SendHorizonal, Square } from "lucide-react"

interface ChatInputProps {
  onSend: (message: string) => void
  onStop?: () => void
  isStreaming?: boolean
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  onStop,
  isStreaming = false,
  disabled = false,
  placeholder = "Ask about company policies...",
}: ChatInputProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = "auto"
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`
    }
  }, [input])

  const handleSubmit = () => {
    if (isStreaming && onStop) {
      onStop()
      return
    }
    if (!input.trim() || disabled) return
    onSend(input)
    setInput("")
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-xl border border-border bg-background p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-primary/50 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground",
              "min-h-[36px] max-h-[160px]",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!isStreaming && (!input.trim() || disabled)}
            className={cn(
              "h-8 w-8 shrink-0 rounded-lg p-0",
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
              {isStreaming ? "Stop generating" : "Send message"}
            </span>
          </Button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          {"Powered by Ollama (llama3) + RAG | Responses based on indexed knowledge base only"}
        </p>
      </div>
    </div>
  )
}
