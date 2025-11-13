import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, MessageSquare, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getUser } from "@/lib/get-user"

export default async function AdminPage() {
  const user = await getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const supabase = await createClient()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Check if user is admin
  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Get stats
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: totalPosts } = await supabase.from("posts").select("*", { count: "exact", head: true })

  const { count: totalMessages } = await supabase.from("messages").select("*", { count: "exact", head: true })

  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <DashboardNav userRole={profile?.role} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Manage users, content, and system settings</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-4 mb-6 sm:mb-8">
          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalPosts || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalMessages || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Platform Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">+12%</div>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 mb-6 sm:mb-8">
          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                asChild
                variant="outline"
                className="w-full justify-start border-primary/20 hover:bg-primary/5 bg-transparent"
              >
                <Link href="/admin/users">View All Users</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start border-primary/20 hover:bg-primary/5 bg-transparent"
              >
                <Link href="/admin/artists">Manage Artists</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start border-primary/20 hover:bg-primary/5 bg-transparent"
              >
                <Link href="/admin/subscriptions">Subscription Management</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                asChild
                variant="outline"
                className="w-full justify-start border-primary/20 hover:bg-primary/5 bg-transparent"
              >
                <Link href="/admin/posts">Review Posts</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start border-primary/20 hover:bg-primary/5 bg-transparent"
              >
                <Link href="/admin/comments">Moderate Comments</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start border-primary/20 hover:bg-primary/5 bg-transparent"
              >
                <Link href="/admin/reports">View Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Users */}
        <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers?.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between border-b border-border/40 pb-4 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">{user.display_name}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right">
                      <p className="text-sm font-medium capitalize text-foreground">{user.role}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.subscription_tier}</p>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-primary/20 hover:bg-primary/5 shrink-0 bg-transparent"
                    >
                      <Link href={`/admin/users/${user.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
