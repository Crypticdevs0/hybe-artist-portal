import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { CreatePostDialog } from "@/components/create-post-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Heart, TrendingUp } from "lucide-react"

export default async function ArtistDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Check if user is an artist
  const { data: artist } = await supabase.from("artists").select("*").eq("profile_id", user.id).single()

  if (!artist || profile?.role !== "artist") {
    redirect("/dashboard")
  }

  // Get artist posts
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      likes (id),
      comments (id)
    `)
    .eq("artist_id", artist.id)
    .order("created_at", { ascending: false })

  // Calculate stats
  const totalLikes = posts?.reduce((sum, post) => sum + post.likes.length, 0) || 0
  const totalComments = posts?.reduce((sum, post) => sum + post.comments.length, 0) || 0

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav userRole={profile?.role} />

      <div className="mx-auto max-w-7xl px-4 py-4 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Artist Dashboard</h1>
            <p className="text-muted-foreground text-sm md:text-base mt-1 md:mt-2">
              Manage your content and engage with fans
            </p>
          </div>
          <CreatePostDialog artistId={artist.id} />
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:gap-6 grid-cols-3 mb-6 md:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Posts</CardTitle>
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold">{posts?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Likes</CardTitle>
              <Heart className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold">{totalLikes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Comments</CardTitle>
              <MessageSquare className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold">{totalComments}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Your Recent Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {!posts || posts.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                You haven&apos;t created any posts yet. Create your first post to start engaging with fans!
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                    <div className="flex-1">
                      <h3 className="font-semibold">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.likes.length}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {post.comments.length}
                        </span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
