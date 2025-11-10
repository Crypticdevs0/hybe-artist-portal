import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"

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

    // Create server-side Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {},
      },
    })

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
      posts: (posts || []).map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content.substring(0, 150), // Preview
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
