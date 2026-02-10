"use client"

import React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  MessageSquarePlus,
  FileText,
  Settings,
  Database,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface ChatSidebarProps {
  activeTab: "chat" | "documents" | "settings"
  onTabChange: (tab: "chat" | "documents" | "settings") => void
  onNewChat: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function ChatSidebar({
  activeTab,
  onTabChange,
  onNewChat,
  collapsed = false,
  onToggleCollapse,
}: ChatSidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] border-r border-[hsl(var(--sidebar-border))] transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--sidebar-border))]">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--sidebar-primary))]">
              <span className="text-sm font-bold text-[hsl(var(--sidebar-primary-foreground))]">
                S
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-none">
                Shinhan AI
              </span>
              <span className="text-[10px] text-[hsl(var(--sidebar-foreground))] opacity-60 mt-0.5">
                RAG Assistant
              </span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--sidebar-primary))]">
            <span className="text-sm font-bold text-[hsl(var(--sidebar-primary-foreground))]">
              S
            </span>
          </div>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={onNewChat}
          variant="outline"
          className={cn(
            "w-full border-[hsl(var(--sidebar-border))] bg-transparent text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]",
            collapsed ? "px-0 justify-center" : "justify-start gap-2"
          )}
          size="sm"
        >
          <MessageSquarePlus className="h-4 w-4 shrink-0" />
          {!collapsed && <span>New Chat</span>}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 flex-1">
        <NavItem
          icon={<MessageSquarePlus className="h-4 w-4" />}
          label="Chat"
          active={activeTab === "chat"}
          collapsed={collapsed}
          onClick={() => onTabChange("chat")}
        />
        <NavItem
          icon={<FileText className="h-4 w-4" />}
          label="Documents"
          active={activeTab === "documents"}
          collapsed={collapsed}
          onClick={() => onTabChange("documents")}
        />
        <NavItem
          icon={<Settings className="h-4 w-4" />}
          label="Settings"
          active={activeTab === "settings"}
          collapsed={collapsed}
          onClick={() => onTabChange("settings")}
        />
      </nav>

      {/* Status indicators */}
      <div className="p-3 border-t border-[hsl(var(--sidebar-border))]">
        {!collapsed ? (
          <div className="space-y-2">
            <StatusIndicator
              label="Ollama"
              status="simulated"
              icon={<Database className="h-3 w-3" />}
            />
            <StatusIndicator
              label="ChromaDB"
              status="simulated"
              icon={<Activity className="h-3 w-3" />}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-400" />
            <div className="h-2 w-2 rounded-full bg-amber-400" />
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className="flex items-center justify-center p-3 border-t border-[hsl(var(--sidebar-border))] hover:bg-[hsl(var(--sidebar-accent))] transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </aside>
  )
}

function NavItem({
  icon,
  label,
  active,
  collapsed,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  collapsed: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center rounded-lg px-3 py-2 text-sm transition-colors",
        collapsed ? "justify-center" : "gap-3",
        active
          ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))] font-medium"
          : "text-[hsl(var(--sidebar-foreground))] opacity-70 hover:opacity-100 hover:bg-[hsl(var(--sidebar-accent))]"
      )}
    >
      {icon}
      {!collapsed && label}
    </button>
  )
}

function StatusIndicator({
  label,
  status,
  icon,
}: {
  label: string
  status: "connected" | "disconnected" | "simulated"
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      {icon}
      <span className="opacity-70">{label}</span>
      <span
        className={cn(
          "ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-medium",
          status === "connected" && "bg-emerald-500/20 text-emerald-400",
          status === "disconnected" && "bg-red-500/20 text-red-400",
          status === "simulated" && "bg-amber-500/20 text-amber-400"
        )}
      >
        {status === "simulated" ? "demo" : status}
      </span>
    </div>
  )
}
