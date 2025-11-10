export async function logError(
  context: string,
  error: unknown,
  metadata?: Record<string, unknown>
) {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined

  if (process.env.NODE_ENV === "production") {
    try {
      await fetch("/api/logs/error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          message: errorMessage,
          stack: errorStack,
          timestamp: new Date().toISOString(),
          metadata,
        }),
      }).catch(() => {
        // Silently fail to prevent infinite loops
      })
    } catch {
      // Silently fail in production
    }
  } else {
    console.error(`[${context}]`, error, metadata)
  }
}
