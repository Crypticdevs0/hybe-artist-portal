import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"
import Link from "next/link"

export default async function CommentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Check if user is admin
  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Get recent comments
  const { data: comments } = await supabase
    .from("comments")
    .select(
      `
      *,
      user:profiles!user_id (
        id,
        display_name,
        avatar_url
      ),
      post:posts!post_id (
        id,
        title
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(20)

  const { count: totalComments } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <DashboardNav userRole={profile?.role} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        <div className="mb-6 sm:mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mb-4"
          >
            <Icon name="ArrowLeft" className="h-4 w-4" />
            Back to Admin
          </Link>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Comment Moderation</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Review and moderate user comments</p>
        </div>

        {/* Stats */}
        <Card className="border-primary/10 bg-card/80 backdrop-blur-sm mb-6 sm:mb-8">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <Icon name="MessageSquare" className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalComments || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">across all posts</p>
          </CardContent>
        </Card>

        {/* Comments List */}
        <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="MessageSquare" className="h-5 w-5" />
              Recent Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-border/40 pb-4 last:border-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {comment.user?.display_name || "Unknown User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          On: {comment.post?.title || "Post"}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="outline" size="sm" disabled className="text-xs">
                          Approve
                        </Button>
                        <Button variant="destructive" size="sm" disabled className="text-xs">
                          Remove
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded line-clamp-2">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon name="MessageSquare" className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-sm text-muted-foreground">No comments to moderate</p>
              </div>
            )}

            <div className="pt-4 border-t border-border/40 mt-4">
              <p className="text-sm text-muted-foreground text-center">
                Full moderation tools coming soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
