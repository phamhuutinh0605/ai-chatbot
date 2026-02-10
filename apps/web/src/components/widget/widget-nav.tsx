"use client"

import { cn } from "@/lib/utils"
import { MessageSquare, Clock, FileText, Settings } from "lucide-react"
import type { WidgetView } from "./chatbot-widget"

interface WidgetNavProps {
  activeView: WidgetView
  onViewChange: (view: WidgetView) => void
  historyCount: number
}

export function WidgetNav({ activeView, onViewChange, historyCount }: WidgetNavProps) {
  const items: Array<{ view: WidgetView; label: string; icon: React.ReactNode; badge?: number }> = [
    { view: "chat", label: "Chat", icon: <MessageSquare className="h-4 w-4" /> },
    {
      view: "history",
      label: "History",
      icon: <Clock className="h-4 w-4" />,
      badge: historyCount > 0 ? historyCount : undefined,
    },
    { view: "documents", label: "Docs", icon: <FileText className="h-4 w-4" /> },
    { view: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
  ]

  return (
    <nav className="flex items-center border-t border-border bg-white">
      {items.map((item) => (
        <button
          key={item.view}
          type="button"
          onClick={() => onViewChange(item.view)}
          className={cn(
            "relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
            activeView === item.view
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="relative">
            {item.icon}
            {item.badge && (
              <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground px-1">
                {item.badge}
              </span>
            )}
          </div>
          <span>{item.label}</span>
          {activeView === item.view && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary" />
          )}
        </button>
      ))}
    </nav>
  )
}
