import type { DocumentMeta } from "@/lib/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

export const documentService = {
  async getAll(): Promise<DocumentMeta[]> {
    const response = await fetch(`${API_BASE_URL}/documents`)
    if (!response.ok) {
      throw new Error("Failed to fetch documents")
    }
    const data = await response.json()
    return data.documents || []
  },

  async getById(id: string): Promise<DocumentMeta> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`)
    if (!response.ok) {
      throw new Error("Failed to fetch document")
    }
    const data = await response.json()
    return data.document
  },

  async uploadMultiple(files: File[]): Promise<{ message: string; files: any[] }> {
    const formData = new FormData()
    
    files.forEach((file) => {
      formData.append("files", file)
    })

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to upload documents")
    }

    return await response.json()
  },

  async upload(file: File): Promise<DocumentMeta> {
    const result = await this.uploadMultiple([file])
    return result.files[0]
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete document")
    }
  },

  async index(filename: string, content: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/documents/index`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filename, content }),
    })

    if (!response.ok) {
      throw new Error("Failed to index document")
    }
  },

  async getCount(): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/documents/count`)
    if (!response.ok) {
      throw new Error("Failed to get document count")
    }
    const data = await response.json()
    return data.count
  },
}
