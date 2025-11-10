import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface SearchResult {
  posts: Array<{
    id: string
    title: string
    content: string
    artist: {
      stage_name: string
      profile: {
        avatar_url?: string
      }
    }
    created_at: string
  }>
  artists: Array<{
    id: string
    display_name: string
    avatar_url?: string
    subscription_tier?: string
    role: string
  }>
}

export async function GET(request: NextRequest): Promise<NextResponse<SearchResult | { error: string }>> {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")?.trim()

    if (!query || query.length < 2) {
      return NextResponse.json({ posts: [], artists: [] })
    }

    // Basic in-memory rate limit (per-instance). For production, use a shared store (Redis).
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'
    const RATE_LIMIT = 60 // requests per minute
    const RATE_WINDOW_MS = 60_000 // 1 minute

    // Attach a simple global map for per-IP counters. This is per-instance only.
    // For robust rate-limiting across instances use Redis, Upstash or similar.
    // @ts-ignore
    if (!global.__searchRateLimit) global.__searchRateLimit = new Map<string, { count: number; reset: number }>()
    // @ts-ignore
    const map: Map<string, { count: number; reset: number }> = global.__searchRateLimit
    const entry = map.get(ip) || { count: 0, reset: Date.now() + RATE_WINDOW_MS }
    if (Date.now() > entry.reset) {
      entry.count = 0
      entry.reset = Date.now() + RATE_WINDOW_MS
    }
    entry.count += 1
    map.set(ip, entry)
    if (entry.count > RATE_LIMIT) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    // Create server-side Supabase client using server helper which reads
    // server-only env vars (SUPABASE_URL and SUPABASE_ANON_KEY). This avoids
    // exposing NEXT_PUBLIC_* values to the client bundle.
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Search posts within user's subscriptions/connections
    const { data: posts } = await supabase
      .from("posts")
      .select(
        `
        *,
        artist:artists!inner (
          id,
          stage_name,
          profile:profiles!artists_profile_id_fkey (
            avatar_url
          )
        )
      `
      )
      .or(
        `title.ilike.%${query}%,content.ilike.%${query}%`
      )
      .limit(10)

    // Search for artists by display name within user's connections
    const { data: artists } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, subscription_tier, role")
      .eq("role", "artist")
      .ilike("display_name", `%${query}%`)
      .limit(10)

    return NextResponse.json({
      posts: (posts || []).map((post: any) => ({
        id: post.id,
        title: post.title,
        content: post.content?.substring(0, 150) || '', // Preview
        artist: post.artist,
        created_at: post.created_at,
      })),
      artists: artists || [],
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 }
    )
  }
}
