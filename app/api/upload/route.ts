import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

interface UploadResponse {
  url?: string
  error?: string
}

// Simple in-memory upload rate limiter (per-instance). Replace with Redis for production.
// @ts-ignore
if (!global.__uploadRateLimit) global.__uploadRateLimit = new Map<string, { count: number; reset: number }>()

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    // Rate-limit by IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'
    const UPLOAD_LIMIT = 10
    const WINDOW_MS = 60_000
    // @ts-ignore
    const map: Map<string, { count: number; reset: number }> = global.__uploadRateLimit
    const entry = map.get(ip) || { count: 0, reset: Date.now() + WINDOW_MS }
    if (Date.now() > entry.reset) {
      entry.count = 0
      entry.reset = Date.now() + WINDOW_MS
    }
    entry.count += 1
    map.set(ip, entry)
    if (entry.count > UPLOAD_LIMIT) {
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
    if (!process.env.VERCEL_BLOB_TOKEN) {
      console.error('VERCEL_BLOB_TOKEN is missing')
      return NextResponse.json({ error: 'Upload service misconfigured' }, { status: 500 })
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

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
}
