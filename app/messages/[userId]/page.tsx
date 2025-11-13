import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { MessageThread } from "@/components/message-thread"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Icon from "@/components/ui/icon"
import Link from "next/link"
import { getUser } from "@/lib/get-user"

interface MessagePageProps {
  params: Promise<{
    userId: string
  }>
}

export default async function MessagePage({ params }: MessagePageProps) {
  const { userId } = await params

  const user = await getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const supabase = await createClient()

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

      <div className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6">
        {/* Header with Back Button */}
          <Link href="/messages" className="inline-block w-fit">
          <Button variant="ghost" size="sm" className="hover:bg-primary/10">
            <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
            Back to Messages
          </Button>
        </Link>

        {/* User Header Card */}
        <Card className="p-4 sm:p-6 border-primary/10 bg-gradient-to-r from-card/80 via-card/60 to-card/40 backdrop-blur-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <Avatar className="h-14 w-14 sm:h-16 sm:w-16 ring-2 ring-primary/20 flex-shrink-0 shadow-md">
                <AvatarImage src={recipientProfile.avatar_url || undefined} alt={recipientProfile.display_name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/20 text-primary font-bold text-lg">
                  {recipientProfile.display_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">
                    {recipientProfile.display_name}
                  </h1>
                  {recipientProfile.role === "artist" && (
                    <Badge className="gradient-hybe text-white text-xs">Artist</Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {recipientProfile.role === "artist" ? "🎤 Artist Account" : "👤 Member Account"}
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-muted-foreground">
              <p>{messages && messages.length > 0 ? `${messages.length} messages` : "New conversation"}</p>
            </div>
          </div>
        </Card>

        {/* Message Thread - Flexible Height */}
        <div className="flex-1 min-h-0">
          <MessageThread
            messages={messages || []}
            currentUserId={user.id}
            recipientId={userId}
            recipientName={recipientProfile.display_name}
            recipientAvatar={recipientProfile.avatar_url}
          />
        </div>
      </div>
    </div>
  )
}
