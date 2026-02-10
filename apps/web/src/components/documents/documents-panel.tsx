"use client"

import React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Upload,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Database,
  Hash,
  Calendar,
} from "lucide-react"
import { useDocuments, useRefreshDocuments, useDocumentCount } from "@/hooks/use-documents"
import type { DocumentMeta } from "@/lib/types"

export function DocumentsPanel() {
  const { data: documents = [], isLoading } = useDocuments()
  const { data: documentCount } = useDocumentCount()
  const refreshMutation = useRefreshDocuments()
  const [uploadOpen, setUploadOpen] = useState(false)

  const handleReindex = async () => {
    await refreshMutation.mutateAsync()
  }

  const totalChunks = documents.reduce((sum, d) => sum + d.chunkCount, 0)
  const indexedCount = documents.filter((d) => d.status === "indexed").length

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div>
          <h1 className="text-base font-semibold text-foreground">
            Knowledge Base
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage documents used for RAG context retrieval
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReindex}
            disabled={refreshMutation.isPending}
            className="gap-2 bg-transparent"
          >
            {refreshMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Reindex All
          </Button>
          <Button
            size="sm"
            onClick={() => setUploadOpen(!uploadOpen)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 p-6">
        <StatCard
          label="Documents"
          value={documents.length}
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          label="Total Chunks"
          value={totalChunks}
          icon={<Hash className="h-4 w-4" />}
        />
        <StatCard
          label="Indexed"
          value={`${indexedCount}/${documents.length}`}
          icon={<Database className="h-4 w-4" />}
        />
      </div>

      {/* Upload area */}
      {uploadOpen && <UploadArea onClose={() => setUploadOpen(false)} />}

      {/* Document list */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-thin">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="border-t border-border bg-card px-6 py-3">
        <p className="text-[11px] text-muted-foreground text-center">
          {"Documents are chunked (300-800 tokens, 50-100 overlap) and embedded using nomic-embed-text via Ollama, then stored in ChromaDB with cosine similarity."}
        </p>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

function DocumentCard({ document }: { document: DocumentMeta }) {
  const statusConfig = {
    indexed: {
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      label: "Indexed",
      variant: "default" as const,
      color: "text-emerald-600",
    },
    indexing: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      label: "Indexing...",
      variant: "secondary" as const,
      color: "text-amber-600",
    },
    pending: {
      icon: <Clock className="h-3.5 w-3.5" />,
      label: "Pending",
      variant: "outline" as const,
      color: "text-muted-foreground",
    },
    error: {
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      label: "Error",
      variant: "destructive" as const,
      color: "text-destructive",
    },
  }

  const status = statusConfig[document.status]

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/20">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <FileText className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {document.filename}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[11px] text-muted-foreground">
            {(document.size / 1024).toFixed(1)} KB
          </span>
          <span className="text-[11px] text-muted-foreground">
            {document.chunkCount} chunks
          </span>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(document.uploadedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <Badge
        variant={status.variant}
        className={cn("gap-1 text-[11px]", status.color)}
      >
        {status.icon}
        {status.label}
      </Badge>
    </div>
  )
}

function UploadArea({ onClose }: { onClose: () => void }) {
  const [dragActive, setDragActive] = useState(false)

  return (
    <div className="px-6 pb-4">
      <div
        className={cn(
          "rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30"
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(false)
          // Handle file drop (simulated)
          onClose()
        }}
      >
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-foreground">
          Drop files here or click to browse
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Supports .md, .txt, .pdf files
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Browse Files
          </Button>
        </div>
      </div>
    </div>
  )
}
