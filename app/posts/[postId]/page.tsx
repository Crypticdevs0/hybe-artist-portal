import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CommentSection } from "@/components/comment-section"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

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

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get post with artist info
  const { data: post } = await supabase
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
      comments (
        *,
        user:profiles!comments_user_id_fkey (
          id,
          display_name,
          avatar_url,
          role
        )
      )
    `)
    .eq("id", postId)
    .single()

  if (!post) {
    notFound()
  }

  // Check if user can view based on subscription
  const canView =
    post.visibility === "all" ||
    (post.visibility === "premium" && ["premium", "vip"].includes(profile?.subscription_tier || "")) ||
    (post.visibility === "vip" && profile?.subscription_tier === "vip")

  if (!canView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <DashboardNav userRole={profile?.role} />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
          <Card className="p-8 sm:p-12 text-center border-primary/10 bg-card/80 backdrop-blur-sm">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
              <Badge className="h-10 w-10 sm:h-12 sm:w-12 gradient-hybe text-white text-lg sm:text-xl">VIP</Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-foreground">Premium Content</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto">
              This content is only available to {post.visibility === "vip" ? "VIP" : "Premium and VIP"} members. Upgrade
              your subscription to unlock.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="gradient-hybe text-white">
                <Link href="/profile">Upgrade Subscription</Link>
              </Button>
              <Button asChild variant="outline" className="border-primary/20 hover:bg-primary/5 bg-transparent">
                <Link href="/dashboard">Return to Feed</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Sort comments by newest first
  const sortedComments =
    post.comments?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <DashboardNav userRole={profile?.role} />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        <Button asChild variant="ghost" size="sm" className="mb-4 hover:bg-primary/5">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feed
          </Link>
        </Button>

        <Card className="border-primary/10 bg-card/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={post.artist.profile.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{post.artist.stage_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{post.artist.stage_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {post.visibility !== "all" && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-600">
                  {post.visibility === "vip" ? "VIP Only" : "Premium"}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold mb-3">{post.title}</h1>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{post.content}</p>
            </div>

            {post.media_url && (
              <img
                src={post.media_url || "/placeholder.svg"}
                alt={post.title}
                className="rounded-lg w-full object-cover max-h-[500px]"
              />
            )}
          </CardContent>

          <CardFooter className="border-t pt-6">
            <CommentSection postId={post.id} comments={sortedComments} currentUserId={user.id} />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
