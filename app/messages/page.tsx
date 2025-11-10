import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { ConversationList } from "@/components/conversation-list"
import { Card } from "@/components/ui/card"
import Icon from "@/components/ui/icon"

export default async function MessagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Get all conversations (messages sent or received)
  const { data: sentMessages } = await supabase
    .from("messages")
    .select("recipient_id, created_at, content, sender_id")
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false })

  const { data: receivedMessages } = await supabase
    .from("messages")
    .select("sender_id, created_at, content, is_read, recipient_id")
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false })

  // Get unique user IDs
  const userIds = new Set<string>()
  sentMessages?.forEach((msg) => userIds.add(msg.recipient_id))
  receivedMessages?.forEach((msg) => userIds.add(msg.sender_id))

  // Get profiles for all users
  const { data: otherProfiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, role")
    .in("id", Array.from(userIds))

  // Build conversations
  const conversations = Array.from(userIds)
    .map((userId) => {
      const otherUser = otherProfiles?.find((p) => p.id === userId)
      const userMessages = [
        ...(sentMessages?.filter((m) => m.recipient_id === userId) || []),
        ...(receivedMessages?.filter((m) => m.sender_id === userId) || []),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      const unreadCount = receivedMessages?.filter((m) => m.sender_id === userId && !m.is_read).length || 0

      return {
        id: userId,
        other_user: otherUser!,
        last_message: userMessages[0] || undefined,
        unread_count: unreadCount,
      }
    })
    .filter((c) => c.other_user)

  // Sort by last message time
  conversations.sort((a, b) => {
    const aTime = a.last_message?.created_at || "0"
    const bTime = b.last_message?.created_at || "0"
    return new Date(bTime).getTime() - new Date(aTime).getTime()
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <DashboardNav userRole={profile?.role} />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Icon name="MessageSquare" className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Messages</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Your conversations with artists and members</p>
        </div>

        {conversations.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center border-primary/10 bg-card/50 backdrop-blur-sm">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
              <Icon name="MessageSquare" className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mb-2 sm:mb-3">No messages yet</p>
            <p className="text-xs sm:text-sm text-muted-foreground/80">Start a conversation with an artist!</p>
          </Card>
        ) : (
          <ConversationList conversations={conversations} currentUserId={user.id} />
        )}
      </div>
    </div>
  )
}
