import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { MessageThread } from "@/components/message-thread"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface MessagePageProps {
  params: Promise<{
    userId: string
  }>
}

export default async function MessagePage({ params }: MessagePageProps) {
  const { userId } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get current user's profile
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Get recipient profile
  const { data: recipientProfile } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, role")
    .eq("id", userId)
    .single()

  if (!recipientProfile) {
    redirect("/messages")
  }

  // Get all messages between these two users
  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, sender_id, created_at")
    .or(`and(sender_id.eq.${user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${user.id})`)
    .order("created_at", { ascending: true })

  // Mark messages as read
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("recipient_id", user.id)
    .eq("sender_id", userId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex flex-col">
      <DashboardNav userRole={profile?.role} />

      <div className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-4 sm:py-6 flex flex-col">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <Link href="/messages">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Messages
            </Button>
          </Link>

          <Card className="p-4 sm:p-6 border-primary/10 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-primary/10">
                <AvatarImage src={recipientProfile.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                  {recipientProfile.display_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                    {recipientProfile.display_name}
                  </h1>
                  {recipientProfile.role === "artist" && (
                    <Badge variant="outline" className="border-primary text-primary text-xs">
                      Artist
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 capitalize">
                  {recipientProfile.role === "artist" ? "Artist Account" : "Member"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Message Thread */}
        <MessageThread
          messages={messages || []}
          currentUserId={user.id}
          recipientId={userId}
          recipientName={recipientProfile.display_name}
          recipientAvatar={recipientProfile.avatar_url}
        />
      </div>
    </div>
  )
}
