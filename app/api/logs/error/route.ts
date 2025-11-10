import { NextResponse } from "next/server"

interface ErrorLog {
  context: string
  message: string
  stack?: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export async function POST(request: Request) {
  try {
    const body: ErrorLog = await request.json()

    const logEntry = {
      ...body,
      userAgent: request.headers.get("user-agent"),
      timestamp: new Date(body.timestamp).toISOString(),
    }

    if (process.env.NODE_ENV === "production") {
      try {
        if (process.env.SENTRY_DSN) {
          const response = await fetch("https://sentry.io/api/store/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `DSN ${process.env.SENTRY_DSN}`,
            },
            body: JSON.stringify({
              level: "error",
              message: logEntry.message,
              contexts: {
                action: logEntry.metadata,
              },
              tags: {
                context: logEntry.context,
              },
              exception: {
                values: [
                  {
                    type: "Error",
                    value: logEntry.message,
                    stacktrace: logEntry.stack
                      ? {
                          frames: logEntry.stack
                            .split("\n")
                            .filter((line) => line.trim())
                            .map((line) => ({
                              context_line: line,
                            })),
                        }
                      : undefined,
                  },
                ],
              },
            }),
          })

          if (!response.ok) {
            console.error("Failed to send error to Sentry:", response.statusText)
          }
        }
      } catch (error) {
        console.error("Failed to log error:", error)
      }
    } else {
      console.log("Error Log Entry:", logEntry)
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error processing error log:", error)
    return NextResponse.json({ error: "Failed to process log" }, { status: 400 })
  }
}
