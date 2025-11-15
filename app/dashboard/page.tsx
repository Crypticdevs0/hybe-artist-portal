import { Card } from "@/components/ui/card"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import Icon from "@/components/ui/icon"
import { Breadcrumb } from "@/components/breadcrumb"
import { FeedDisplay } from "@/components/feed-display"
import { PostCard } from "@/components/post-card"
import Link from "next/link"

export const revalidate = 30 // revalidate every 30 seconds for fresh feed

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get posts with artist info, likes, and comments
  const { data: posts } = await supabase
    .from("posts")
    .select(`
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
    `)
    .order("created_at", { ascending: false })
    .limit(20)

  // Get user's likes to mark posts
  const { data: userLikes } = await supabase.from("likes").select("post_id").eq("user_id", user.id)

  const userLikedPosts = new Set(userLikes?.map((like) => like.post_id) || [])

  const postsWithLikeStatus =
    posts?.map((post) => ({
      ...post,
      user_liked: userLikedPosts.has(post.id),
    })) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <DashboardNav userRole={profile?.role} />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        <Breadcrumb
          items={[
            { label: "Dashboard" },
          ]}
        />
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Icon name="Sparkles" className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Feed</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Latest updates from your favorite artists</p>
        </div>

        {/* Recent and Trending Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Recent Section */}
          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="Clock" className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Recent Posts</h3>
            </div>
            {postsWithLikeStatus.length > 0 ? (
              <div className="space-y-3">
                {postsWithLikeStatus.slice(0, 3).map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <p className="font-medium text-sm text-foreground truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      by {post.artist.stage_name}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent posts</p>
            )}
          </Card>

          {/* Trending Section */}
          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="TrendingUp" className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Trending Now</h3>
            </div>
            {postsWithLikeStatus.length > 0 ? (
              <div className="space-y-3">
                {postsWithLikeStatus
                  .sort((a, b) => (b.likes.length + b.comments.length) - (a.likes.length + a.comments.length))
                  .slice(0, 3)
                  .map((post) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.id}`}
                      className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <p className="font-medium text-sm text-foreground truncate">{post.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Icon name="Heart" className="h-3 w-3" />
                        <span>{post.likes.length}</span>
                        <Icon name="MessageCircle" className="h-3 w-3 ml-1" />
                        <span>{post.comments.length}</span>
                      </div>
                    </Link>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No trending posts</p>
            )}
          </Card>
        </div>

        {/* Main Feed with Sorting and Pagination */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Your Feed</h2>
          <FeedDisplay
            initialPosts={postsWithLikeStatus}
            userId={user.id}
          />
        </div>
      </div>
    </div>
  )
}
