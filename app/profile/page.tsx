import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Calendar, UserIcon } from "lucide-react"
import { format } from "date-fns"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  const subscriptionBadgeColor = {
    basic: "bg-muted-foreground",
    premium: "gradient-hybe text-white",
    vip: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
  }[profile.subscription_tier]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <DashboardNav userRole={profile.role} />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Profile</h1>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-primary/10 shrink-0">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-xl sm:text-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold">
                    {profile.display_name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{profile.display_name}</h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={subscriptionBadgeColor}>{profile.subscription_tier.toUpperCase()}</Badge>
                      {profile.role !== "member" && (
                        <Badge variant="outline" className="border-primary text-primary">
                          {profile.role.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      Member since {format(new Date(profile.created_at), "MMMM yyyy")}
                    </div>
                  </div>

                  {profile.bio && (
                    <div className="pt-4 border-t border-border/40">
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{profile.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Subscription Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <p className="font-semibold text-sm sm:text-base">Current Plan</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                    {profile.subscription_tier === "basic" && "Free access to public content"}
                    {profile.subscription_tier === "premium" && "Access to premium content"}
                    {profile.subscription_tier === "vip" && "Full access to all exclusive content"}
                  </p>
                </div>
                <Badge className={`${subscriptionBadgeColor} shrink-0`}>
                  {profile.subscription_tier.toUpperCase()}
                </Badge>
              </div>

              {profile.subscription_expiry && (
                <div className="pt-4 border-t border-border/40">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Subscription expires: {format(new Date(profile.subscription_expiry), "PPP")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
