import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { PostCard } from "@/components/post-card"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"
import Link from "next/link"
import { Breadcrumb } from "@/components/breadcrumb"

export const revalidate = 60 // revalidate every 60 seconds

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Get artist profile
  const { data: artistProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()

  if (!artistProfile || artistProfile.role !== "artist") {
    redirect("/dashboard")
  }

  // Get artist info
  const { data: artist } = await supabase
    .from("artists")
    .select("*")
    .eq("profile_id", id)
    .single()

  // Get artist's posts
  const { data: posts } = await supabase
    .from("posts")
    .select(
      `
      *,
      artist:artists!inner (
        id,
        stage_name,
        profile:profiles!artists_profile_id_fkey (
          avatar_url
        )
      ),
      likes (id),
      comments (id)
    `
    )
    .eq("artist_id", artist?.id)
    .order("created_at", { ascending: false })

  // Get user's likes
  const { data: userLikes } = await supabase.from("likes").select("post_id").eq("user_id", user.id)

  const userLikedPosts = new Set(userLikes?.map((like) => like.post_id) || [])

  const postsWithLikeStatus =
    posts?.map((post) => ({
      ...post,
      user_liked: userLikedPosts.has(post.id),
    })) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <DashboardNav userRole={profile?.role} />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: artistProfile.display_name },
          ]}
        />

        <Card className="border-primary/10 bg-card/80 backdrop-blur-sm mb-6 sm:mb-8">
          <CardContent className="pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <Avatar className="h-20 w-20 sm:h-28 sm:w-28 ring-4 ring-primary/10 flex-shrink-0">
                <AvatarImage src={artistProfile.avatar_url || undefined} />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold">
                  {artistProfile.display_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4 w-full">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-foreground">
                    {artistProfile.display_name}
                  </h1>
                  {artist?.stage_name && artist.stage_name !== artistProfile.display_name && (
                    <p className="text-lg text-muted-foreground">{artist.stage_name}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Badge className="gradient-hybe text-white">Artist</Badge>
                  </div>
                </div>

                {artistProfile.bio && (
                  <p className="text-base text-muted-foreground leading-relaxed">{artistProfile.bio}</p>
                )}

                <Button asChild className="gradient-hybe text-white hover:opacity-90 transition-opacity w-full sm:w-auto">
                  <Link href={`/messages/${id}`} className="flex items-center justify-center gap-2">
                    <Icon name="Mail" className="h-4 w-4" />
                    Send Message
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Posts</h2>

          {postsWithLikeStatus.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center border-primary/10 bg-card/50 backdrop-blur-sm">
              <p className="text-sm sm:text-base text-muted-foreground">No posts yet</p>
            </Card>
          ) : (
            postsWithLikeStatus.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </div>
    </div>
  )
}
