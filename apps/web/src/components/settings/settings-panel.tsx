"use client"

import { Badge } from "@/components/ui/badge"
import { useChatStore, type Language } from "@/stores/chat-store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Server,
  Database,
  Brain,
  Settings,
  Layers,
  Cpu,
  HardDrive,
  Ruler,
  Languages,
} from "lucide-react"
import { CHROMA_CONFIG, OLLAMA_CONFIG, RAG_CONFIG } from "@/constants/config"

export function SettingsPanel() {
  const { language, setLanguage } = useChatStore()

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div>
          <h1 className="text-base font-semibold text-foreground">
            System Configuration
          </h1>
          <p className="text-xs text-muted-foreground">
            Monorepo architecture overview and service configuration
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Language Preference */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
              <Languages className="h-4 w-4 text-primary" />
              Language Preference
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Response Language</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose how the AI should respond to your questions
                  </p>
                </div>
                <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">🌐 Auto-detect</SelectItem>
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                    <SelectItem value="vi">🇻🇳 Tiếng Việt</SelectItem>
                    <SelectItem value="ko">🇰🇷 한국어</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                <strong>Auto-detect:</strong> AI will respond in the same language as your question.
                <br />
                <strong>Fixed language:</strong> AI will always respond in the selected language.
              </div>
            </div>
          </section>
          {/* Architecture overview */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
              <Layers className="h-4 w-4 text-primary" />
              Monorepo Architecture
            </h2>
            <div className="bg-muted rounded-lg p-4 font-mono text-xs leading-relaxed text-foreground">
              <pre>{`/
├── apps/
│   ├── web/          → React + TailwindCSS frontend
│   └── api/          → NestJS backend (WebSocket + REST)
│
├── packages/
│   ├── rag/          → Chunking, prompt building
│   ├── vector/       → Chroma vector DB abstraction
│   ├── ollama/       → Ollama client wrapper
│   ├── ui/           → Shared UI components (shadcn-style)
│   └── shared/       → Types & utilities
│
├── documents/        → Knowledge base (.md, .txt, .pdf)
│   ├── leave_policy.md
│   ├── salary_policy.md
│   ├── it_security_policy.md
│   └── onboarding_guide.md
│
├── pnpm-workspace.yaml
└── package.json`}</pre>
            </div>
          </section>

          {/* Service configs */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Ollama config */}
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                <Cpu className="h-4 w-4 text-primary" />
                Ollama Configuration
              </h3>
              <div className="space-y-3">
                <ConfigRow label="Base URL" value={OLLAMA_CONFIG.baseUrl} />
                <ConfigRow
                  label="Chat Model"
                  value={OLLAMA_CONFIG.chatModel}
                  badge
                />
                <ConfigRow
                  label="Embed Model"
                  value={OLLAMA_CONFIG.embedModel}
                  badge
                />
                <ConfigRow
                  label="Status"
                  value="Demo Mode"
                  status="simulated"
                />
              </div>
            </section>

            {/* Chroma config */}
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                <Database className="h-4 w-4 text-primary" />
                ChromaDB Configuration
              </h3>
              <div className="space-y-3">
                <ConfigRow label="Host" value={CHROMA_CONFIG.host} />
                <ConfigRow
                  label="Collection"
                  value={CHROMA_CONFIG.collectionName}
                />
                <ConfigRow label="Similarity" value="Cosine" badge />
                <ConfigRow
                  label="Status"
                  value="Demo Mode"
                  status="simulated"
                />
              </div>
            </section>

            {/* RAG config */}
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                <Brain className="h-4 w-4 text-primary" />
                RAG Configuration
              </h3>
              <div className="space-y-3">
                <ConfigRow
                  label="Chunk Size"
                  value={`${RAG_CONFIG.chunkSize} tokens`}
                />
                <ConfigRow
                  label="Chunk Overlap"
                  value={`${RAG_CONFIG.chunkOverlap} tokens`}
                />
                <ConfigRow label="Top K" value={String(RAG_CONFIG.topK)} />
                <ConfigRow label="Search" value="Vector Similarity" badge />
              </div>
            </section>

            {/* Backend config */}
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                <Server className="h-4 w-4 text-primary" />
                Backend Services
              </h3>
              <div className="space-y-3">
                <ConfigRow label="Runtime" value="NestJS" badge />
                <ConfigRow label="Streaming" value="WebSocket (Socket.IO)" />
                <ConfigRow label="REST" value="POST /documents, /reindex" />
                <ConfigRow label="Package Manager" value="pnpm workspaces" />
              </div>
            </section>
          </div>

          {/* RAG Flow */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
              <Ruler className="h-4 w-4 text-primary" />
              RAG Query Flow
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <FlowStep step={1} label="User Question" />
              <FlowArrow />
              <FlowStep step={2} label="Embed Query" />
              <FlowArrow />
              <FlowStep step={3} label="Vector Search (TopK)" />
              <FlowArrow />
              <FlowStep step={4} label="Build RAG Prompt" />
              <FlowArrow />
              <FlowStep step={5} label="Ollama Generate" />
              <FlowArrow />
              <FlowStep step={6} label="Stream via WebSocket" />
            </div>
          </section>

          {/* System Prompt */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
              <HardDrive className="h-4 w-4 text-primary" />
              System Prompt
            </h2>
            <div className="rounded-lg bg-muted p-4 text-sm text-foreground leading-relaxed">
              {RAG_CONFIG.systemPrompt}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function ConfigRow({
  label,
  value,
  badge = false,
  status,
}: {
  label: string
  value: string
  badge?: boolean
  status?: "connected" | "disconnected" | "simulated"
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      {status ? (
        <Badge
          variant="outline"
          className={
            status === "connected"
              ? "text-emerald-600 border-emerald-200"
              : status === "simulated"
                ? "text-amber-600 border-amber-200"
                : "text-destructive border-destructive/30"
          }
        >
          {value}
        </Badge>
      ) : badge ? (
        <Badge variant="secondary" className="font-mono text-xs">
          {value}
        </Badge>
      ) : (
        <span className="font-mono text-xs text-foreground">{value}</span>
      )}
    </div>
  )
}

function FlowStep({ step, label }: { step: number; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
        {step}
      </span>
      <span className="text-foreground font-medium">{label}</span>
    </div>
  )
}

function FlowArrow() {
  return (
    <span className="text-muted-foreground text-lg">{"→"}</span>
  )
}
