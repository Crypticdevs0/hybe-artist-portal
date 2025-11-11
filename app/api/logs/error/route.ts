import { NextResponse } from "next/server"
import { initSentry, Sentry } from "@/lib/sentry/init"

interface ErrorLog {
  context: string
  message: string
  stack?: string
  timestamp: string
  metadata?: Record<string, unknown>
}

// Initialize Sentry if configured
initSentry()

export async function POST(request: Request) {
  try {
    const body: ErrorLog = await request.json()

    const logEntry = {
      ...body,
      userAgent: request.headers.get("user-agent"),
      timestamp: new Date(body.timestamp).toISOString(),
    }

    if (process.env.SENTRY_DSN) {
      // Use Sentry SDK for robust error reporting
      Sentry.captureException(new Error(`[${logEntry.context}] ${logEntry.message}`), {
        extra: {
          metadata: logEntry.metadata,
          userAgent: logEntry.userAgent,
        },
      })
      // flush before returning in serverless environments (best-effort)
      try {
        await Sentry.flush(2000)
      } catch (e) {
        // ignore flush errors
      }
    } else {
      // In non-production, log to console for debugging
      console.log("Error Log Entry:", logEntry)
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    // Report unexpected processing errors to Sentry if configured, otherwise warn
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(error)
    } else {
      console.warn("Error processing error log:", error)
    }
    return NextResponse.json({ error: "Failed to process log" }, { status: 400 })
  }
}
