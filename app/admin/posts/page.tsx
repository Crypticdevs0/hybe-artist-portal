import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Eye, Trash2 } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default async function AdminPostsPage() {
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

  // Get all posts with artist info
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      artist:artists!inner (
        id,
        stage_name
      ),
      likes (id),
      comments (id)
    `)
    .order("created_at", { ascending: false })

  const visibilityColors = {
    all: "bg-green-500",
    premium: "bg-purple-500",
    vip: "bg-amber-500",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav userRole={profile?.role} />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-muted-foreground mt-2">Review and moderate all posts on the platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Posts ({posts?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {posts?.map((post) => (
                <div key={post.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={visibilityColors[post.visibility as keyof typeof visibilityColors]}>
                        {post.visibility.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">by {post.artist.stage_name}</span>
                    </div>

                    <h3 className="font-semibold">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.content}</p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{post.likes.length} likes</span>
                      <span>{post.comments.length} comments</span>
                      <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/posts/${post.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {(!posts || posts.length === 0) && (
                <div className="py-12 text-center text-muted-foreground">No posts found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
