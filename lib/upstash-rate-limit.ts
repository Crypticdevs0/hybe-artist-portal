import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

type LimitResult = { success: boolean; limit?: number; remaining?: number; reset?: number }

const useUpstash = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

// Helper to create a Ratelimit instance
function createUpstashLimiter(max: number, windowSec: number) {
  if (!useUpstash) return null
  const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! })
  const rl = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(max, `${windowSec} s`) })
  return rl
}

// Export two pre-created limiters (uploads and search) and a generic fallback
export const uploadLimiter = createUpstashLimiter(10, 60) // 10 requests / 60s
export const searchLimiter = createUpstashLimiter(60, 60) // 60 requests / 60s

// Fallback in-memory limiter (per-instance). Keeps same simple API: limiter.limit(key) -> { success }
const globalKey = '__app_rate_limit_map'
if (!(global as any)[globalKey]) (global as any)[globalKey] = new Map<string, { count: number; reset: number }>()
const inMemoryMap: Map<string, { count: number; reset: number }> = (global as any)[globalKey]

export async function fallbackLimit(key: string, max = 60, windowSec = 60): Promise<LimitResult> {
  const WINDOW_MS = windowSec * 1000
  const entry = inMemoryMap.get(key) || { count: 0, reset: Date.now() + WINDOW_MS }
  if (Date.now() > entry.reset) {
    entry.count = 0
    entry.reset = Date.now() + WINDOW_MS
  }
  entry.count += 1
  inMemoryMap.set(key, entry)
  return { success: entry.count <= max, limit: max, remaining: Math.max(0, max - entry.count), reset: entry.reset }
}

// Helper wrapper that tries Upstash limiter then falls back
export async function limitWithUpstash(limiter: Ratelimit | null, key: string, max: number, windowSec: number): Promise<LimitResult> {
  try {
    if (limiter) {
      const res = await limiter.limit(key)
      // res has `success` boolean and metadata depending on implementation
      return { success: Boolean(res.success), limit: res.limit, remaining: res.remaining, reset: res.reset }
    }
  } catch (err) {
    console.warn('Upstash limiter failed, falling back to in-memory limiter', (err as Error).message)
  }
  return fallbackLimit(key, max, windowSec)
}

export default {
  uploadLimiter,
  searchLimiter,
  limitWithUpstash,
}
