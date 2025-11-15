import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default async function AdminSubscriptionsPage() {
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

  // Get users with subscription info
  const { data: subscribers } = await supabase
    .from("profiles")
    .select("*")
    .neq("subscription_tier", "basic")
    .order("created_at", { ascending: false })

  // Calculate subscription stats
  const subscriptionStats = {
    premium: subscribers?.filter((s) => s.subscription_tier === "premium").length || 0,
    vip: subscribers?.filter((s) => s.subscription_tier === "vip").length || 0,
    total: subscribers?.length || 0,
    monthlyRevenue: ((subscribers?.length || 0) * 49.99).toFixed(2),
  }

  const tierColors = {
    vip: "bg-amber-500",
    premium: "bg-purple-500",
    basic: "bg-gray-500",
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Subscription Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Track subscriptions and revenue</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-4 mb-6 sm:mb-8">
          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Premium Subscribers</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{subscriptionStats.premium}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">VIP Subscribers</CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{subscriptionStats.vip}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Premium</CardTitle>
              <TrendingUp className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{subscriptionStats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Estimated Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">${subscriptionStats.monthlyRevenue}</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Subscriptions */}
        <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Active Premium Subscriptions ({subscribers?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {subscribers && subscribers.length > 0 ? (
              <div className="space-y-4">
                {subscribers.map((subscriber) => (
                  <div
                    key={subscriber.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-border/40 pb-4 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm sm:text-base text-foreground">{subscriber.display_name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{subscriber.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Subscribed since {format(new Date(subscriber.created_at), "PPP")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Badge
                        className={`${tierColors[subscriber.subscription_tier as keyof typeof tierColors]} text-xs shrink-0`}
                      >
                        {subscriber.subscription_tier.toUpperCase()}
                      </Badge>
                      <Button variant="outline" size="sm" className="bg-transparent text-xs sm:text-sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <p className="text-sm sm:text-base text-muted-foreground">No premium subscriptions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
