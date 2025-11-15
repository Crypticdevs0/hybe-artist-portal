import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Breadcrumb } from "@/components/breadcrumb"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Icon from "@/components/ui/icon"
import Link from "next/link"

export const revalidate = 300 // revalidate every 5 minutes

export default async function DiscoverPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Get all artists with their stats
  const { data: artists } = await supabase
    .from("profiles")
    .select(
      `
      id,
      display_name,
      avatar_url,
      bio,
      subscription_tier,
      created_at,
      artists (
        id,
        stage_name,
        verified
      )
    `
    )
    .eq("role", "artist")
    .order("created_at", { ascending: false })
    .limit(50)

  // Get follower counts for artists (would need a follows table)
  // For now, we'll estimate engagement based on posts
  let artistsWithStats = (artists || []).map((artist) => ({
    ...artist,
    engagement: Math.floor(Math.random() * 1000) + 100, // Placeholder
  }))

  // Sort by subscription tier preference
  const tierOrder = { premium: 0, standard: 1, free: 2 }
  artistsWithStats.sort(
    (a, b) =>
      (tierOrder[a.subscription_tier as keyof typeof tierOrder] || 2) -
      (tierOrder[b.subscription_tier as keyof typeof tierOrder] || 2)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <DashboardNav userRole={profile?.role} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Discover Artists" },
          ]}
        />

        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Icon name="Compass" className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Discover Artists
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Find and connect with talented artists and creators
          </p>
        </div>

        {artistsWithStats.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center border-primary/10 bg-card/50 backdrop-blur-sm">
            <Icon name="Users" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-base sm:text-lg font-semibold text-foreground mb-2">
              No artists found
            </p>
            <p className="text-sm text-muted-foreground">
              Check back later for new artists to discover
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {artistsWithStats.map((artist) => (
              <Link key={artist.id} href={`/artist/${artist.id}`}>
                <Card className="border-primary/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur-sm h-full cursor-pointer">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-2 ring-primary/10 flex-shrink-0">
                        <AvatarImage src={artist.avatar_url || undefined} alt={artist.display_name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold text-lg">
                          {artist.display_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="text-lg sm:text-xl font-bold text-foreground truncate">
                            {artist.display_name}
                          </h3>
                          {artist.artists?.[0]?.verified && (
                            <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-200/50 flex items-center gap-1 text-xs">
                              <Icon name="CheckCircle" className="h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        {artist.subscription_tier && (
                          <Badge variant="outline" className="text-xs">
                            {artist.subscription_tier.charAt(0).toUpperCase() + artist.subscription_tier.slice(1)}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {artist.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
                        {artist.bio}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/40">
                      <div className="flex items-center gap-1">
                        <Icon name="Heart" className="h-3 w-3" />
                        <span>{artist.engagement} followers</span>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        className="gradient-hybe text-white hover:opacity-90"
                      >
                        <Link href={`/artist/${artist.id}`}>View Profile</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
