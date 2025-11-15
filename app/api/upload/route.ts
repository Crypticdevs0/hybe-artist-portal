import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { uploadLimiter, limitWithUpstash } from "@/lib/upstash-rate-limit"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

interface UploadResponse {
  url?: string
  thumbnail_url?: string
  error?: string
}

// Simple in-memory upload rate limiter (per-instance). Replace with Redis for production.
// @ts-ignore
if (!global.__uploadRateLimit) global.__uploadRateLimit = new Map<string, { count: number; reset: number }>()

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    // Rate-limit by IP using Upstash (with in-memory fallback)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'
    const res = await limitWithUpstash(uploadLimiter, ip, 10, 60)
    if (!res.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    // Require authenticated user for uploads
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure Vercel blob token is configured server-side
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN environment variable is not configured. Please set BLOB_READ_WRITE_TOKEN in your environment.')
      return NextResponse.json({
        error: 'Upload service misconfigured. Please contact support if this persists.'
      }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
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
    ]

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed. Supported: Images (JPG, PNG, WebP, GIF, AVIF), Videos (MP4, WebM, MOV), Documents (PDF, DOC, DOCX, XLS, XLSX)` },
        { status: 400 }
      )
    }

    // Generate unique filename and sanitize extension
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const rawExt = String(file.name).split('.').pop() || ''
    const fileExtension = rawExt.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'bin'
    const filename = `${timestamp}-${random}.${fileExtension}`

    // Optionally sanitize images (strip metadata) and generate a thumbnail if `sharp` is available
    let uploadTarget: any = file
    let thumbnailUrl: string | undefined = undefined
    if (file.type.startsWith('image/')) {
      try {
        const sharp = await import('sharp')
        const ab = await file.arrayBuffer()
        const buffer = Buffer.from(ab)
        // Sharp by default removes metadata unless withMetadata() is used
        const processed = await sharp.default(buffer).toBuffer()
        uploadTarget = processed

        // Create a thumbnail (webp) for faster delivery in feeds
        try {
          const thumbBuffer = await sharp.default(processed)
            .resize({ width: 800, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer()

          const thumbFilename = `${timestamp}-${random}-thumb.webp`
          const thumbBlob = await put(thumbFilename, thumbBuffer, {
            access: 'public',
            addRandomSuffix: false,
          })
          thumbnailUrl = thumbBlob.url
        } catch (thumbErr) {
          console.warn('Thumbnail generation failed:', (thumbErr as Error)?.message || thumbErr)
        }
      } catch (err) {
        // If sharp isn't installed or processing fails, continue with original file
        console.warn('Image sanitization skipped:', (err as Error)?.message || err)
      }
    }

    // Upload original (or processed) to Vercel Blob
    const blob = await put(filename, uploadTarget, {
      access: "public",
      addRandomSuffix: false,
    })

    return NextResponse.json({ url: blob.url, thumbnail_url: thumbnailUrl })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}
