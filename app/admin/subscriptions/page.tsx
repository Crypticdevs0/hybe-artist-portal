import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, TrendingUp } from "lucide-react"
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

  // Get subscription statistics
  const { data: allUsers } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  const subscriptionStats = {
    basic: allUsers?.filter((u) => u.subscription_tier === "basic").length || 0,
    premium: allUsers?.filter((u) => u.subscription_tier === "premium").length || 0,
    vip: allUsers?.filter((u) => u.subscription_tier === "vip").length || 0,
  }

  const basicUsers = allUsers?.filter((u) => u.subscription_tier === "basic") || []
  const premiumUsers = allUsers?.filter((u) => u.subscription_tier === "premium") || []
  const vipUsers = allUsers?.filter((u) => u.subscription_tier === "vip") || []

  const tierColors = {
    basic: "bg-gray-500",
    premium: "bg-purple-500",
    vip: "bg-amber-500",
  }

  const renderSubscriptionTierCard = (tierName: string, tierLabel: string, count: number, users: any[]) => (
    <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{tierLabel} Subscribers</CardTitle>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-2xl font-bold">{count}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.length > 0 ? (
            users.slice(0, 5).map((subscriber) => (
              <div
                key={subscriber.id}
                className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{subscriber.display_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{subscriber.email}</p>
                  {subscriber.subscription_expiry && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Expires: {format(new Date(subscriber.subscription_expiry), "MMM dd, yyyy")}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="ml-2">
                  Manage
                </Button>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">No subscribers yet</div>
          )}
          {users.length > 5 && (
            <div className="text-center pt-2">
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                View All {count} Subscribers
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Subscription Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">View and manage user subscriptions</p>
        </div>

        {/* Subscription Overview */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3 mb-6 sm:mb-8">
          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Basic Users</CardTitle>
              <Badge className="bg-gray-500">BASIC</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{subscriptionStats.basic}</div>
              <p className="text-xs text-muted-foreground mt-1">Free tier members</p>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
              <Badge className="bg-purple-500">PREMIUM</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{subscriptionStats.premium}</div>
              <p className="text-xs text-muted-foreground mt-1">Premium subscribers</p>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">VIP Users</CardTitle>
              <Badge className="bg-amber-500">VIP</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{subscriptionStats.vip}</div>
              <p className="text-xs text-muted-foreground mt-1">VIP elite members</p>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Tiers */}
        <div className="grid gap-6 md:grid-cols-3">
          {renderSubscriptionTierCard("basic", "Basic", subscriptionStats.basic, basicUsers)}
          {renderSubscriptionTierCard("premium", "Premium", subscriptionStats.premium, premiumUsers)}
          {renderSubscriptionTierCard("vip", "VIP", subscriptionStats.vip, vipUsers)}
        </div>
      </div>
    </div>
  )
}
