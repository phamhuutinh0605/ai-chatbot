"use client"

import { cn } from "@/lib/utils"
import { MessageSquare, Trash2, Clock, Plus } from "lucide-react"
import type { Conversation } from "@/lib/types"

interface WidgetHistoryProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (conv: Conversation) => void
  onDelete: (id: string) => void
  onNewChat: () => void
}

export function WidgetHistory({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onNewChat,
}: WidgetHistoryProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mb-3">
          <Clock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">No conversations yet</h3>
        <p className="mt-1 text-xs text-muted-foreground text-center">
          Start a new chat to see your conversation history here.
        </p>
        <button
          type="button"
          onClick={onNewChat}
          className="mt-4 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New Chat
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-3 space-y-1.5">
          {conversations.map((conv) => {
            const messageCount = conv.messages.length
            const lastMessage = conv.messages[conv.messages.length - 1]
            const isActive = conv.id === activeId

            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelect(conv)}
                className={cn(
                  "w-full rounded-xl border p-3 text-left transition-colors group",
                  isActive
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-background hover:bg-accent/50 hover:border-primary/20"
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {conv.title}
                    </p>
                    {lastMessage && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                        {lastMessage.content.slice(0, 60)}
                        {lastMessage.content.length > 60 ? "..." : ""}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-muted-foreground">
                        {messageCount} messages
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatRelativeTime(conv.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(conv.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* New chat button at bottom */}
      <div className="p-3 border-t border-border">
        <button
          type="button"
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-accent/50 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Start New Conversation
        </button>
      </div>
    </div>
  )
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
