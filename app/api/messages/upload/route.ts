import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { uploadLimiter, limitWithUpstash } from "@/lib/upstash-rate-limit"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

interface UploadResponse {
  success?: boolean
  url?: string
  storage_path?: string
  file_name?: string
  file_size?: number
  file_type?: string
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    // Rate-limit by IP using Upstash (with in-memory fallback)
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown"
    const res = await limitWithUpstash(uploadLimiter, ip, 20, 60)
    if (!res.success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    // Require authenticated user for uploads
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const messageId = formData.get("messageId") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!messageId) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit. Uploaded: ${(file.size / 1024 / 1024).toFixed(2)}MB` },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedMimeTypes = [
      // Images
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
      // Videos
      "video/mp4",
      "video/webm",
      "video/quicktime",
      // Documents
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      // Audio
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
    ]

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `File type not allowed. Supported: Images (JPG, PNG, WebP, GIF, AVIF), Videos (MP4, WebM, MOV), Documents (PDF, DOC, DOCX, XLS, XLSX), Audio (MP3, WAV, OGG)`,
        },
        { status: 400 }
      )
    }

    // Generate unique filename and sanitize extension
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const rawExt = String(file.name).split(".").pop() || ""
    const fileExtension = rawExt.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "bin"
    const sanitizedFileName = String(file.name)
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .substring(0, 255)
    const filename = `${timestamp}-${random}.${fileExtension}`

    // Upload to Supabase Storage
    const storagePath = `messages/${messageId}/${filename}`
    const buffer = await file.arrayBuffer()

    const { data, error: uploadError } = await supabase.storage
      .from("chat-attachments")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError)
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 }
      )
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("chat-attachments").getPublicUrl(storagePath)

    // Insert attachment record in database
    const { error: dbError } = await supabase
      .from("message_attachments")
      .insert({
        message_id: messageId,
        file_name: sanitizedFileName,
        file_size: file.size,
        file_type: file.type,
        storage_path: storagePath,
      })

    if (dbError) {
      console.error("Database insert error:", dbError)
      // Attempt to delete the uploaded file
      await supabase.storage.from("chat-attachments").remove([storagePath])
      return NextResponse.json(
        { error: "Failed to save attachment metadata" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      storage_path: storagePath,
      file_name: sanitizedFileName,
      file_size: file.size,
      file_type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}
