"use client"

import { useRef, useEffect } from "react"
import { ChatBubble } from "./chat-bubble"
import type { ChatMessage } from "@/lib/types"
import { Bot, Sparkles } from "lucide-react"

interface ChatMessagesProps {
  messages: ChatMessage[]
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (messages.length === 0) {
    return <EmptyState />
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
      </div>
    </div>
  )
}

function EmptyState() {
  const suggestions = [
    "What is the annual leave policy?",
    "How is the salary structure organized?",
    "What are the password requirements?",
    "Tell me about the onboarding process",
  ]

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Shinhan AI Assistant
          </h2>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Ask questions about company policies, HR guidelines, IT security, and more. All answers are generated from the indexed knowledge base.
          </p>
        </div>

        <div className="mt-4 w-full space-y-2">
          <p className="text-xs font-medium text-muted-foreground flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3" />
            Try asking
          </p>
          <div className="grid gap-2">
            {suggestions.map((text) => (
              <SuggestionButton key={text} text={text} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SuggestionButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      className="rounded-lg border border-border bg-card px-4 py-2.5 text-left text-sm text-foreground shadow-sm transition-colors hover:bg-accent hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={() => {
        // Dispatch a custom event so the parent can pick it up
        const event = new CustomEvent("suggestion-click", {
          detail: { text },
        })
        window.dispatchEvent(event)
      }}
    >
      {text}
    </button>
  )
}
