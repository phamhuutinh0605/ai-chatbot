/**
 * React Query Keys
 * Centralized query key management for consistent caching
 */

export const queryKeys = {
  // Documents
  documents: {
    all: ["documents"] as const,
    lists: () => [...queryKeys.documents.all, "list"] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.documents.lists(), filters] as const,
    details: () => [...queryKeys.documents.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.documents.details(), id] as const,
    count: () => [...queryKeys.documents.all, "count"] as const,
  },

  // Chat
  chat: {
    all: ["chat"] as const,
    conversations: () => [...queryKeys.chat.all, "conversations"] as const,
    conversation: (id: string) =>
      [...queryKeys.chat.conversations(), id] as const,
    messages: (conversationId: string) =>
      [...queryKeys.chat.all, "messages", conversationId] as const,
  },

  // User
  user: {
    all: ["user"] as const,
    profile: () => [...queryKeys.user.all, "profile"] as const,
    settings: () => [...queryKeys.user.all, "settings"] as const,
  },
} as const

/**
 * Helper function to create dynamic query keys
 * 
 * @example
 * createQueryKey("documents", "list", { status: "active" })
 * // Returns: ["documents", "list", { status: "active" }]
 */
export function createQueryKey(
  domain: string,
  ...parts: (string | number | Record<string, any>)[]
): readonly unknown[] {
  return [domain, ...parts] as const
}

/**
 * Type-safe query key factory
 * 
 * @example
 * const key = queryKeyFactory("documents", "detail", "doc-123")
 */
export function queryKeyFactory<T extends readonly unknown[]>(
  ...parts: T
): T {
  return parts
}
