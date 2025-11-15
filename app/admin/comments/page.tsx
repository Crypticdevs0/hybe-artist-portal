import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageSquare, Trash2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default async function AdminCommentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Get recent comments with related data
  const { data: comments } = await supabase
    .from("comments")
    .select(
      `
      *,
      author:author_id(display_name, avatar_url),
      post:post_id(id, title, content)
    `
    )
    .order("created_at", { ascending: false })
    .limit(50)

  const commentStats = {
    total: comments?.length || 0,
    recent: comments?.filter((c) => {
      const commentDate = new Date(c.created_at)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return commentDate > thirtyDaysAgo
    }).length || 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <DashboardNav userRole={profile?.role} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        <Button asChild variant="ghost" size="sm" className="mb-4 hover:bg-primary/10">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Link>
        </Button>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Comment Moderation</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Review and manage user comments</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 mb-6 sm:mb-8">
          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{commentStats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
              <MessageSquare className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{commentStats.recent}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Comments */}
        <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Comments</CardTitle>
          </CardHeader>
          <CardContent>
            {comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment: any) => (
                  <div
                    key={comment.id}
                    className="flex flex-col gap-3 border-b border-border/40 pb-4 last:border-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm sm:text-base text-foreground">
                          {comment.author?.display_name || "Unknown User"}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          On post: {comment.post?.title || "Unknown Post"}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {format(new Date(comment.created_at), "MMM dd")}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground bg-muted/30 rounded p-3 break-words">
                      {comment.content}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm sm:text-base text-muted-foreground">No comments yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
