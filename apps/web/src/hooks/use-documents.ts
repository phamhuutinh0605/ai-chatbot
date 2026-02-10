import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { documentService } from "@/services/document.service"
import { queryKeys } from "@/constants/query-keys"
import type { DocumentMeta } from "@/lib/types"

export function useDocuments(filters?: Record<string, any>) {
  return useQuery({
    queryKey: filters ? queryKeys.documents.list(filters) : queryKeys.documents.lists(),
    queryFn: () => documentService.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: queryKeys.documents.detail(id),
    queryFn: () => documentService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useDocumentCount() {
  return useQuery({
    queryKey: queryKeys.documents.count(),
    queryFn: () => documentService.getCount(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => documentService.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all })
    },
  })
}

export function useUploadMultipleDocuments() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (files: File[]) => documentService.uploadMultiple(files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all })
    },
  })
}

export function useRefreshDocuments() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents.all })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => documentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all })
    },
  })
}
