import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { PostCard } from "@/components/post-card"
import { CommentSection } from "@/components/comment-section"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function PostPage({
  params,
}: {
  params: Promise<{ postId: string }>
}) {
  const { postId } = await params

  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Get post with artist info, likes, and comments
  const { data: post } = await supabase
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
      comments:comments!left (
        id,
        content,
        created_at,
        user:profiles!comments_user_id_fkey (
          id,
          display_name,
          avatar_url,
          role
        )
      )
    `
    )
    .eq("id", postId)
    .single()

  if (!post) {
    redirect("/dashboard")
  }

  // Get user's likes
  const { data: userLikes } = await supabase.from("likes").select("post_id").eq("user_id", user.id)

  const userLikedPosts = new Set(userLikes?.map((like) => like.post_id) || [])

  const postWithLikeStatus = {
    ...post,
    user_liked: userLikedPosts.has(post.id),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <DashboardNav userRole={profile?.role} />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </Link>

        <div className="space-y-6">
          <PostCard post={postWithLikeStatus} />

          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="text-lg">Comments</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <CommentSection
                postId={post.id}
                comments={post.comments || []}
                currentUserId={user.id}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
