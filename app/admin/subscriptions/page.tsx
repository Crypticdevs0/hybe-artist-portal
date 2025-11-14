import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"
import Link from "next/link"

export default async function SubscriptionsPage() {
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

  // Get subscription statistics
  const { count: basicCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("subscription_tier", "basic")

  const { count: premiumCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("subscription_tier", "premium")

  const { count: vipCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("subscription_tier", "vip")

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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Subscription Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Manage user subscriptions and tiers</p>
        </div>

        {/* Subscription Stats */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3 mb-6 sm:mb-8">
          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Basic Tier</CardTitle>
              <div className="h-8 w-8 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                <Icon name="User" className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{basicCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Free users</p>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Premium Tier</CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Icon name="Crown" className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{premiumCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Premium users</p>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">VIP Tier</CardTitle>
              <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Icon name="Sparkles" className="h-4 w-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{vipCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">VIP users</p>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Management */}
        <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Settings" className="h-5 w-5" />
              Tier Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="rounded-lg border border-border/40 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Basic Tier</h3>
                    <p className="text-sm text-muted-foreground mt-1">Free access to public content</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-xs bg-muted px-2 py-1 rounded">Public posts only</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">Limited messaging</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled className="text-xs">
                    View Users
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 p-4 bg-primary/5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Premium Tier</h3>
                    <p className="text-sm text-muted-foreground mt-1">Access to premium content</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Premium posts</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Direct messaging</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Early access</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled className="text-xs">
                    View Users
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-amber-500/20 p-4 bg-amber-500/5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground">VIP Tier</h3>
                    <p className="text-sm text-muted-foreground mt-1">Full access to all exclusive content</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-1 rounded">All content</span>
                      <span className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-1 rounded">Priority support</span>
                      <span className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-1 rounded">Exclusive events</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled className="text-xs">
                    View Users
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/40">
              <p className="text-sm text-muted-foreground text-center">
                Full subscription management features coming soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
