import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageSquare, Flag, Trash2 } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

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

  // Get all comments with post and user info
  const { data: comments } = await supabase
    .from("comments")
    .select(`
      *,
      user:profiles!inner (
        id,
        display_name,
        email,
        avatar_url
      ),
      post:posts!inner (
        id,
        title,
        artist_id
      )
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <DashboardNav userRole={profile?.role} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Link>
        </Button>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Comment Moderation</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Review and moderate all user comments</p>
        </div>

        {/* Comments Stats */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 mb-6 sm:mb-8">
          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{comments?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Comments across all posts</p>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">0</div>
              <p className="text-xs text-muted-foreground mt-1">Flagged for review</p>
            </CardContent>
          </Card>
        </div>

        {/* Comments List */}
        <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>All Comments ({comments?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comments?.map((comment) => (
                <div
                  key={comment.id}
                  className="flex flex-col gap-3 border-b border-border/40 pb-4 last:border-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="font-semibold text-sm">{comment.user.display_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {comment.user.email}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Commented on: <span className="font-medium text-foreground">{comment.post.title}</span>
                      </p>
                      <p className="text-sm text-foreground">{comment.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <Button asChild variant="outline" size="sm" className="bg-transparent">
                      <Link href={`/posts/${comment.post.id}`}>View Post</Link>
                    </Button>
                    <Button variant="outline" size="sm" className="bg-transparent border-amber-500/50 hover:bg-amber-500/10">
                      <Flag className="h-4 w-4 mr-2" />
                      Flag
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}

              {(!comments || comments.length === 0) && (
                <div className="py-12 text-center text-muted-foreground">No comments found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
