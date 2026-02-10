"use client"

import {
  MessageCircle,
  BookOpen,
  Shield,
  Zap,
  Globe,
  HelpCircle,
} from "lucide-react"

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Smart Conversations",
    description:
      "Ask questions in natural language and get accurate, context-aware answers instantly.",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description:
      "Powered by your company's internal documents, policies, and guidelines for reliable answers.",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description:
      "All data stays within your organization. No information is sent to external services.",
  },
  {
    icon: Zap,
    title: "Real-time Responses",
    description:
      "Answers stream in real-time so you don't have to wait for the full response.",
  },
  {
    icon: Globe,
    title: "Always Available",
    description:
      "Get help 24/7 without waiting for a human agent. Support whenever you need it.",
  },
  {
    icon: HelpCircle,
    title: "Source References",
    description:
      "Every answer comes with references to the original documents so you can verify information.",
  },
]

export function WidgetSettings() {
  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
      {/* Header intro */}
      <div className="p-4 pb-2">
        <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            About Shinhan AI Assistant
          </h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Your intelligent workplace assistant that helps you find information
            from internal documents quickly and accurately. Just ask a question
            and get the answer you need.
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="px-4 pt-2 pb-1">
        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          What I can do
        </h4>
      </div>
      <div className="flex-1 px-4 pb-4 space-y-2.5">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="flex gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/20"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <feature.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground">
                {feature.title}
              </p>
              <p className="text-[11px] leading-relaxed text-muted-foreground mt-0.5">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          Shinhan AI Assistant v1.0 - Internal Use Only
        </p>
      </div>
    </div>
  )
}
