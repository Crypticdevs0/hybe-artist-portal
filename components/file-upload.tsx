"use client"

import { UploadCloud, X, AlertCircle, CheckCircle } from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  onUpload: (url: string, fileName: string) => void
  maxSize?: number
  accept?: string
  label?: string
  disabled?: boolean
}

export function FileUpload({
  onUpload,
  maxSize = 10 * 1024 * 1024,
  accept = "image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx",
  label = "Upload File",
  disabled = false,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)

  const handleUpload = async (file: File) => {
    setError(null)

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size exceeds ${maxSize / 1024 / 1024}MB limit`)
      return
    }

    setIsUploading(true)
    setFileName(file.name)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      // Create preview for images/videos
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      }

      onUpload(data.url, file.name)
      setFileName(file.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dragRef.current) {
      dragRef.current.classList.add("border-primary", "bg-primary/5")
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dragRef.current) {
      dragRef.current.classList.remove("border-primary", "bg-primary/5")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dragRef.current) {
      dragRef.current.classList.remove("border-primary", "bg-primary/5")
    }

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleClear = () => {
    setPreview(null)
    setFileName(null)
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-3">
      {!preview && !fileName && (
        <div
          ref={dragRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="relative border-2 border-dashed border-border rounded-lg p-6 transition-all cursor-pointer hover:border-primary/50 hover:bg-primary/2.5"
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept={accept}
            disabled={disabled || isUploading}
          />

          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-3 p-3 rounded-full bg-primary/10">
              <UploadCloud className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">{label}</p>
            <p className="text-xs text-muted-foreground">
              Drag and drop or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Max {maxSize / 1024 / 1024}MB
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {isUploading && (
        <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 flex items-center gap-2">
          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0" />
          <p className="text-sm text-primary">Uploading...</p>
        </div>
      )}

      {preview && (
        <div className="relative rounded-lg overflow-hidden border border-border bg-muted/30">
          {preview.startsWith("data:image/") ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-40 object-cover"
            />
          ) : preview.startsWith("data:video/") ? (
            <video
              src={preview}
              className="w-full h-40 object-cover bg-black"
              controls
            />
          ) : null}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute top-2 right-2 bg-background/80 hover:bg-background"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {fileName && !preview && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">File uploaded successfully</p>
            <p className="text-xs text-green-600/70 dark:text-green-400/70 truncate mt-0.5">{fileName}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
