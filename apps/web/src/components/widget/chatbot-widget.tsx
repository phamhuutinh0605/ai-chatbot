"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { MessageCircle, X } from "lucide-react"
import { WidgetChat } from "./widget-chat"
import { WidgetHistory } from "./widget-history"
import { WidgetDocuments } from "./widget-documents"
import { WidgetSettings } from "./widget-settings"
import { WidgetNav } from "./widget-nav"
import type { Conversation } from "@/lib/types"

export type WidgetView = "chat" | "history" | "documents" | "settings"

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [view, setView] = useState<WidgetView>("chat")

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        panelRef.current && !panelRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [chatKey, setChatKey] = useState(0)

  const handleNewChat = useCallback(() => {
    setChatKey((k) => k + 1)
    setActiveConversationId(null)
    setView("chat")
  }, [])

  const handleSaveConversation = useCallback((conversation: Conversation) => {
    setConversations((prev) => {
      const existing = prev.findIndex((c) => c.id === conversation.id)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = conversation
        return updated
      }
      return [conversation, ...prev]
    })
  }, [])

  const handleSelectConversation = useCallback((conv: Conversation) => {
    setActiveConversationId(conv.id)
    setChatKey((k) => k + 1)
    setView("chat")
  }, [])

  const handleDeleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id))
    if (activeConversationId === id) {
      setActiveConversationId(null)
      setChatKey((k) => k + 1)
    }
  }, [activeConversationId])

  const activeConversation = activeConversationId
    ? conversations.find((c) => c.id === activeConversationId) ?? null
    : null

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95",
          isOpen
            ? "bg-foreground text-background rotate-0"
            : "bg-primary text-primary-foreground"
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <div className="relative">
          <MessageCircle
            className={cn(
              "h-6 w-6 transition-all duration-300",
              isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
            )}
          />
          <X
            className={cn(
              "h-6 w-6 absolute inset-0 transition-all duration-300",
              isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
            )}
          />
        </div>
        {/* Unread indicator */}
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-primary border-2 border-background" />
          </span>
        )}
      </button>

      {/* Widget panel */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl transition-all duration-300 origin-bottom-right",
          isOpen
            ? "w-[400px] h-[600px] scale-100 opacity-100 translate-y-0"
            : "w-[400px] h-[600px] scale-95 opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {/* Widget header */}
        <WidgetHeader view={view} onNewChat={handleNewChat} />

        {/* Content area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {view === "chat" && (
            <WidgetChat
              key={chatKey}
              initialConversation={activeConversation}
              onSaveConversation={handleSaveConversation}
            />
          )}
          {view === "history" && (
            <WidgetHistory
              conversations={conversations}
              activeId={activeConversationId}
              onSelect={handleSelectConversation}
              onDelete={handleDeleteConversation}
              onNewChat={handleNewChat}
            />
          )}
          {view === "documents" && <WidgetDocuments />}
          {view === "settings" && <WidgetSettings />}
        </div>

        {/* Bottom navigation */}
        <WidgetNav
          activeView={view}
          onViewChange={setView}
          historyCount={conversations.length}
        />
      </div>
    </>
  )
}

function WidgetHeader({ view, onNewChat }: { view: WidgetView; onNewChat: () => void }) {
  const titles: Record<WidgetView, { title: string; subtitle: string }> = {
    chat: { title: "Shinhan AI", subtitle: "Knowledge Assistant" },
    history: { title: "Chat History", subtitle: "Previous conversations" },
    documents: { title: "Knowledge Base", subtitle: "Indexed documents" },
    settings: { title: "Settings", subtitle: "System configuration" },
  }

  const { title, subtitle } = titles[view]

  return (
    <div className="flex items-center gap-3 bg-primary px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/20">
        <span className="text-sm font-bold text-primary-foreground">S</span>
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold text-primary-foreground leading-none">
          {title}
        </h2>
        <p className="text-[11px] text-primary-foreground/70 mt-0.5">{subtitle}</p>
      </div>
      {view === "chat" && (
        <button
          type="button"
          onClick={onNewChat}
          className="rounded-md px-2 py-1 text-[11px] font-medium text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
        >
          New Chat
        </button>
      )}
    </div>
  )
}
