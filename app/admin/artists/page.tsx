import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getUser } from "@/lib/get-user"

export default async function AdminArtistsPage() {
  const user = await getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const supabase = await createClient()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Get all artists with their profiles
  const { data: artists } = await supabase
    .from("artists")
    .select(`
      *,
      profile:profiles!artists_profile_id_fkey (
        id,
        display_name,
        email,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false })

  // Get post counts for each artist
  const { data: postCounts } = await supabase.from("posts").select("artist_id")

  const postCountsByArtist =
    postCounts?.reduce(
      (acc, post) => {
        acc[post.artist_id] = (acc[post.artist_id] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

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
          <h1 className="text-3xl font-bold text-gray-900">Artist Management</h1>
          <p className="text-muted-foreground mt-2">Manage artist accounts and their activity</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Artists ({artists?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {artists?.map((artist) => (
                <div key={artist.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={artist.profile.avatar_url || undefined} />
                      <AvatarFallback>{artist.stage_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{artist.stage_name}</p>
                        {artist.is_active ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {artist.profile.display_name} • {artist.profile.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{postCountsByArtist[artist.id] || 0} posts</p>
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              ))}

              {(!artists || artists.length === 0) && (
                <div className="py-12 text-center text-muted-foreground">No artists found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
