export const ACCEPTED_FILE_TYPES = [".md", ".txt", ".pdf", ".doc", ".docx"] as const
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export type AcceptedFileType = typeof ACCEPTED_FILE_TYPES[number]

export interface FileValidationError {
  file: string
  error: string
}

export function validateFile(file: File): string | null {
  const ext = `.${file.name.split(".").pop()?.toLowerCase()}`
  
  if (!ACCEPTED_FILE_TYPES.includes(ext as AcceptedFileType)) {
    return `Unsupported format. Use ${ACCEPTED_FILE_TYPES.join(", ")}`
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return "File too large. Maximum 10MB."
  }
  
  return null
}

export function validateFiles(files: File[]): {
  valid: File[]
  invalid: FileValidationError[]
} {
  const valid: File[] = []
  const invalid: FileValidationError[] = []
  
  for (const file of files) {
    const error = validateFile(file)
    if (error) {
      invalid.push({ file: file.name, error })
    } else {
      valid.push(file)
    }
  }
  
  return { valid, invalid }
}

export function getFileExtension(filename: string): string {
  return `.${filename.split(".").pop()?.toLowerCase() || ""}`
}

export function isAcceptedFileType(filename: string): boolean {
  const ext = getFileExtension(filename)
  return ACCEPTED_FILE_TYPES.includes(ext as AcceptedFileType)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}
