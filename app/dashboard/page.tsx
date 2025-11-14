import { Card } from "@/components/ui/card"
import { redirect } from "next/navigation"

export const revalidate = 3600 // revalidate every hour
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { PostCard } from "@/components/post-card"
import Icon from "@/components/ui/icon"

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
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Icon name="Sparkles" className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Feed</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Latest updates from your favorite artists</p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {postsWithLikeStatus.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center border-primary/10 bg-card/50 backdrop-blur-sm">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
                <Icon name="Sparkles" className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                No posts yet. Check back soon for updates from artists!
              </p>
            </Card>
          ) : (
            postsWithLikeStatus.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </div>
    </div>
  )
}
