"use client"

import { useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  FileText,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  Upload,
  X,
  File,
  AlertCircle,
} from "lucide-react"
import { useDocuments, useUploadDocument, useUploadMultipleDocuments, useRefreshDocuments } from "@/hooks/use-documents"
import { validateFile, ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/file-validation"
import type { DocumentMeta } from "@/lib/types"

const CATEGORY_LABELS: Record<string, string> = {
  leave_policy: "HR Policy",
  salary_policy: "Compensation",
  it_security_policy: "IT & Security",
  onboarding_guide: "Onboarding",
}

const FRIENDLY_NAMES: Record<string, string> = {
  "leave_policy.md": "Leave & Time Off Policy",
  "salary_policy.md": "Salary & Benefits Guide",
  "it_security_policy.md": "IT Security Guidelines",
  "onboarding_guide.md": "New Employee Onboarding",
}

function getFileIcon(filename: string) {
  if (filename.endsWith(".pdf")) return "PDF"
  if (filename.endsWith(".doc") || filename.endsWith(".docx")) return "DOC"
  if (filename.endsWith(".md")) return "MD"
  return "TXT"
}

export function WidgetDocuments() {
  const { data: documents = [], isLoading } = useDocuments()
  const uploadMutation = useUploadDocument()
  const uploadMultipleMutation = useUploadMultipleDocuments()
  const refreshMutation = useRefreshDocuments()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<
    { name: string; progress: number; status: "uploading" | "done" | "error"; error?: string }[]
  >([])
  const [showUploadArea, setShowUploadArea] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const indexedCount = documents.filter((d) => d.status === "indexed").length

  const filteredDocs = documents.filter((doc) => {
    const name = FRIENDLY_NAMES[doc.filename] || doc.filename
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const handleReindex = async () => {
    await refreshMutation.mutateAsync()
  }

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      
      // Validate all files first
      const validFiles: File[] = []
      for (const file of fileArray) {
        const error = validateFile(file)
        if (error) {
          setUploadingFiles((prev) => [
            ...prev,
            { name: file.name, progress: 0, status: "error", error },
          ])
        } else {
          validFiles.push(file)
          setUploadingFiles((prev) => [
            ...prev,
            { name: file.name, progress: 0, status: "uploading" },
          ])
        }
      }

      if (validFiles.length === 0) {
        setShowUploadArea(false)
        return
      }

      try {
        // Simulate upload progress
        for (let i = 1; i <= 3; i++) {
          await new Promise((r) => setTimeout(r, 400))
          setUploadingFiles((prev) =>
            prev.map((f) =>
              validFiles.some((vf) => vf.name === f.name)
                ? { ...f, progress: i * 30 }
                : f
            )
          )
        }

        // Upload all files at once
        await uploadMultipleMutation.mutateAsync(validFiles)

        // Mark all as done
        setUploadingFiles((prev) =>
          prev.map((f) =>
            validFiles.some((vf) => vf.name === f.name)
              ? { ...f, progress: 100, status: "done" }
              : f
          )
        )

        // Clear after a moment
        setTimeout(() => {
          setUploadingFiles((prev) =>
            prev.filter((f) => !validFiles.some((vf) => vf.name === f.name))
          )
        }, 2000)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Upload failed"
        setUploadingFiles((prev) =>
          prev.map((f) =>
            validFiles.some((vf) => vf.name === f.name)
              ? { ...f, status: "error", error: errorMessage }
              : f
          )
        )
      }

      setShowUploadArea(false)
    },
    [uploadMultipleMutation]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const dismissUpload = (name: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.name !== name))
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-xs text-muted-foreground">Loading documents...</p>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col h-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-primary/5 backdrop-blur-sm border-2 border-dashed border-primary rounded-2xl m-1">
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-primary">Drop files here</p>
            <p className="text-[11px] text-muted-foreground">
              {ACCEPTED_FILE_TYPES.join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Header info */}
      <div className="px-4 pt-4 pb-2">
        <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Upload documents to extend the assistant&apos;s knowledge. Supported
            formats: TXT, MD, PDF, DOC.
          </p>
        </div>
      </div>

      {/* Search + Upload + Sync */}
      <div className="px-4 py-2 flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowUploadArea(!showUploadArea)}
          className={cn(
            "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors border",
            showUploadArea
              ? "text-primary bg-primary/10 border-primary/20"
              : "text-muted-foreground bg-card border-border hover:text-primary hover:border-primary/20"
          )}
        >
          <Upload className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={handleReindex}
          disabled={refreshMutation.isPending}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-primary bg-primary/5 hover:bg-primary/10 transition-colors disabled:opacity-50 border border-primary/10"
        >
          {refreshMutation.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          Sync
        </button>
      </div>

      {/* Upload area */}
      {showUploadArea && (
        <div className="px-4 pb-2 animate-fade-in">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed border-primary/20 bg-primary/[0.02] hover:bg-primary/5 hover:border-primary/30 transition-colors p-4 flex flex-col items-center gap-2 cursor-pointer group"
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-foreground">
                Click to browse files
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                or drag & drop anywhere on this panel
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {ACCEPTED_FILE_TYPES.join(", ").toUpperCase()} up to 10MB
            </p>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".md,.txt,.pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFiles(e.target.files)
                e.target.value = ""
              }
            }}
          />
        </div>
      )}

      {/* Upload progress */}
      {uploadingFiles.length > 0 && (
        <div className="px-4 pb-2 space-y-1.5">
          {uploadingFiles.map((f) => (
            <div
              key={f.name}
              className={cn(
                "flex items-center gap-2 rounded-lg border p-2 text-xs animate-fade-in",
                f.status === "error"
                  ? "border-destructive/20 bg-destructive/5"
                  : f.status === "done"
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-border bg-card"
              )}
            >
              {f.status === "uploading" && (
                <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
              )}
              {f.status === "done" && (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              )}
              {f.status === "error" && (
                <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-foreground">
                  {f.name}
                </p>
                {f.status === "uploading" && (
                  <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                )}
                {f.status === "error" && f.error && (
                  <p className="text-[10px] text-destructive mt-0.5">
                    {f.error}
                  </p>
                )}
                {f.status === "done" && (
                  <p className="text-[10px] text-emerald-600 mt-0.5">
                    Indexed successfully
                  </p>
                )}
              </div>
              {f.status !== "uploading" && (
                <button
                  type="button"
                  onClick={() => dismissUpload(f.name)}
                  className="shrink-0 p-0.5 rounded hover:bg-muted transition-colors"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Status summary */}
      <div className="px-4 pb-2">
        <p className="text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground">{indexedCount}</span> of{" "}
          <span className="font-medium text-foreground">
            {documents.length}
          </span>{" "}
          documents ready
        </p>
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pb-4 space-y-2">
        {filteredDocs.map((doc) => {
          const friendlyName = FRIENDLY_NAMES[doc.filename] || doc.filename
          const category = CATEGORY_LABELS[doc.id] || "Document"
          const fileTag = getFileIcon(doc.filename)
          const isInitialDoc = ["leave_policy", "salary_policy", "it_security_policy", "onboarding_guide"].includes(doc.id)

          return (
            <div
              key={doc.id}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/20"
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg shrink-0 mt-0.5",
                  isInitialDoc ? "bg-primary/10" : "bg-amber-500/10"
                )}
              >
                {isInitialDoc ? (
                  <FileText className="h-4 w-4 text-primary" />
                ) : (
                  <File className="h-4 w-4 text-amber-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground leading-snug truncate">
                  {friendlyName}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {category}
                  </span>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {fileTag}
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-1 text-[10px] font-medium",
                      doc.status === "indexed"
                        ? "text-emerald-600"
                        : doc.status === "indexing"
                          ? "text-amber-600"
                          : "text-muted-foreground"
                    )}
                  >
                    {doc.status === "indexed" ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : doc.status === "indexing" ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : null}
                    {doc.status === "indexed"
                      ? "Ready"
                      : doc.status === "indexing"
                        ? "Syncing..."
                        : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {filteredDocs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Search className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground">
              No documents match your search.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          Uploaded documents are processed and added to the knowledge base
          automatically.
        </p>
      </div>
    </div>
  )
}
