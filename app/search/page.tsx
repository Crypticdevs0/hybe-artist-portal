import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PostCard } from "@/components/post-card"
import Icon from "@/components/ui/icon"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface SearchParams {
  q?: string
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const query = params.q?.trim()

  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  let posts: any[] = []
  let artists: any[] = []
  let searchError = false

  if (query && query.length >= 2) {
    const { data: postsData, error: postsError } = await supabase
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
        ),
        likes (id),
        comments (id)
      `
      )
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .limit(20)

    const { data: artistsData, error: artistsError } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, subscription_tier, role")
      .eq("role", "artist")
      .ilike("display_name", `%${query}%`)
      .limit(20)

    if (postsError || artistsError) {
      searchError = true
    }

    posts = postsData || []
    artists = artistsData || []

    if (posts.length > 0) {
      const { data: userLikes } = await supabase.from("likes").select("post_id").eq("user_id", user.id)
      const userLikedPosts = new Set(userLikes?.map((like) => like.post_id) || [])

      posts = posts.map((post) => ({
        ...post,
        user_liked: userLikedPosts.has(post.id),
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <DashboardNav userRole={profile?.role} />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <Icon name="Search" className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground truncate">
              {query ? `Search Results for "${query}"` : "Search"}
            </h1>
          </div>
        </div>

        {!query && (
          <Card className="p-8 sm:p-12 text-center border-primary/10 bg-card/50 backdrop-blur-sm">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
              <Icon name="Search" className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <p className="text-base sm:text-lg font-semibold mb-2 text-foreground">Start searching</p>
            <p className="text-sm text-muted-foreground">Enter at least 2 characters to search for posts and artists</p>
          </Card>
        )}

        {query && query.length < 2 && (
          <Card className="p-8 sm:p-12 text-center border-primary/10 bg-card/50 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground">Please enter at least 2 characters to search</p>
          </Card>
        )}

        {query && query.length >= 2 && (
          <div className="space-y-8">
            {searchError && (
              <Card className="p-4 border-destructive/20 bg-destructive/5">
                <p className="text-sm text-destructive">An error occurred while searching. Please try again.</p>
              </Card>
            )}

            {posts.length === 0 && artists.length === 0 && (
              <Card className="p-8 sm:p-12 text-center border-primary/10 bg-card/50 backdrop-blur-sm">
                <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
                  <Icon name="Search" className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </div>
                <p className="text-base sm:text-lg font-semibold mb-2 text-foreground">No results found</p>
                <p className="text-sm text-muted-foreground">Try searching with different keywords</p>
              </Card>
            )}

            {artists.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Icon name="Users" className="h-5 w-5 text-primary" />
                  <h2 className="text-lg sm:text-xl font-bold">Artists ({artists.length})</h2>
                </div>
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                  {artists.map((artist) => (
                    <Link key={artist.id} href={`/artist/${artist.id}`}>
                      <Card className="border-primary/10 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer bg-card/80 backdrop-blur-sm h-full">
                        <CardContent className="flex items-center gap-4 p-4">
                          <Avatar className="h-14 w-14 flex-shrink-0 ring-2 ring-primary/10">
                            <AvatarImage src={artist.avatar_url || undefined} alt={artist.display_name} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold">
                              {artist.display_name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">{artist.display_name}</p>
                            {artist.subscription_tier && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                <Badge variant="outline" className="border-primary text-primary text-xs">
                                  Artist
                                </Badge>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {posts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Icon name="FileText" className="h-5 w-5 text-primary" />
                  <h2 className="text-lg sm:text-xl font-bold">Posts ({posts.length})</h2>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
