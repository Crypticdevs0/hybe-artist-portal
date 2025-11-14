"use client"

import { useState, useRef } from "react"
import dynamic from "next/dynamic"
import Icon from "@/components/ui/icon"

const Paperclip = dynamic(() => import("lucide-react").then((m) => m.Paperclip), { ssr: false })
const Upload = dynamic(() => import("lucide-react").then((m) => m.Upload), { ssr: false })
const X = dynamic(() => import("lucide-react").then((m) => m.X), { ssr: false })
const CheckCircle2 = dynamic(() => import("lucide-react").then((m) => m.CheckCircle2), { ssr: false })
const AlertCircle = dynamic(() => import("lucide-react").then((m) => m.AlertCircle), { ssr: false })

interface ChatFileUploadProps {
  messageId: string
  onFileUpload: (file: UploadedFile) => void
  onError: (error: string) => void
  disabled?: boolean
}

export interface UploadedFile {
  url: string
  storage_path: string
  file_name: string
  file_size: number
  file_type: string
}

export function ChatFileUpload({ messageId, onFileUpload, onError, disabled }: ChatFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || disabled) return

    setErrorMessage(null)
    const fileArray = Array.from(files)

    for (const file of fileArray) {
      const fileId = `${file.name}-${Date.now()}`
      setUploadingFiles((prev) => new Set(prev).add(fileId))

      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("messageId", messageId)

        const response = await fetch("/api/messages/upload", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Upload failed")
        }

        const uploadedFile: UploadedFile = {
          url: data.url,
          storage_path: data.storage_path,
          file_name: data.file_name,
          file_size: data.file_size,
          file_type: data.file_type,
        }

        setUploadedFiles((prev) => [...prev, uploadedFile])
        onFileUpload(uploadedFile)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Failed to upload file"
        setErrorMessage(errorMsg)
        onError(errorMsg)
      } finally {
        setUploadingFiles((prev) => {
          const newSet = new Set(prev)
          newSet.delete(fileId)
          return newSet
        })
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return "Image"
    if (fileType.startsWith("video/")) return "Video"
    if (fileType.startsWith("audio/")) return "Music"
    if (fileType.includes("pdf")) return "FileText"
    if (fileType.includes("word")) return "FileText"
    if (fileType.includes("sheet")) return "Spreadsheet"
    return "File"
  }

  return (
    <div className="space-y-2">
      {/* File upload area */}
      <div
        className={`relative rounded-lg border-2 border-dashed transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-primary/20 bg-muted/30 hover:border-primary/40"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={disabled}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="w-full p-3 flex flex-col items-center justify-center gap-2 text-center"
        >
          <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
            <Upload className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs sm:text-sm font-medium text-foreground">
              Drop files here or click to browse
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Max 10MB per file • Images, Videos, Documents, Audio
            </p>
          </div>
        </button>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-2 sm:p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
          <span className="text-xs sm:text-sm text-destructive">{errorMessage}</span>
        </div>
      )}

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Attached Files:</p>
          {uploadedFiles.map((file, index) => (
            <div
              key={`${file.storage_path}-${index}`}
              className="flex items-center justify-between gap-2 p-2 sm:p-3 bg-muted/50 border border-primary/10 rounded-lg"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Icon
                  name={getFileIcon(file.file_type)}
                  className="h-4 w-4 text-primary flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate text-foreground">
                    {file.file_name}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {formatFileSize(file.file_size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                  className="p-1 hover:bg-destructive/10 rounded transition-colors disabled:opacity-50"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploading files */}
      {uploadingFiles.size > 0 && (
        <div className="space-y-2">
          {Array.from(uploadingFiles).map((fileId) => (
            <div
              key={fileId}
              className="flex items-center justify-between gap-2 p-2 sm:p-3 bg-muted/50 border border-primary/10 rounded-lg animate-pulse"
            >
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary animate-bounce" />
                <p className="text-xs sm:text-sm text-muted-foreground">Uploading...</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
