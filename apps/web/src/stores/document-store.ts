import { create } from "zustand"
import type { DocumentMeta } from "@/lib/types"

interface DocumentStore {
  selectedDocument: DocumentMeta | null
  searchQuery: string
  setSelectedDocument: (document: DocumentMeta | null) => void
  setSearchQuery: (query: string) => void
  clearSelection: () => void
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  selectedDocument: null,
  searchQuery: "",

  setSelectedDocument: (document) =>
    set({ selectedDocument: document }),

  setSearchQuery: (query) =>
    set({ searchQuery: query }),

  clearSelection: () =>
    set({ selectedDocument: null, searchQuery: "" }),
}))
