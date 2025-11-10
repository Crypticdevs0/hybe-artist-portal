import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { MessageThread } from "@/components/message-thread"
import { Card, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function MessageThreadPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId: recipientId } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Get recipient profile
  const { data: recipient } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, role")
    .eq("id", recipientId)
    .single()

  if (!recipient) {
    notFound()
  }

  // Get messages between users
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`,
    )
    .order("created_at", { ascending: true })

  // Mark messages as read
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("recipient_id", user.id)
    .eq("sender_id", recipientId)
    .eq("is_read", false)

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav userRole={profile?.role} />

      <div className="mx-auto max-w-4xl px-4 py-4 md:py-8">
        <Card>
          <CardHeader className="border-b p-4">
            <div className="flex items-center gap-2 md:gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/messages">
                  <ArrowLeft className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Back</span>
                </Link>
              </Button>

              <Avatar className="h-8 w-8 md:h-10 md:w-10">
                <AvatarImage src={recipient.avatar_url || undefined} />
                <AvatarFallback>{recipient.display_name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex items-center gap-2 min-w-0 flex-1">
                <h2 className="text-base md:text-xl font-semibold truncate">{recipient.display_name}</h2>
                {recipient.role === "artist" && (
                  <Badge variant="outline" className="border-primary text-primary shrink-0">
                    Artist
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <MessageThread
            messages={messages || []}
            currentUserId={user.id}
            recipientId={recipientId}
            recipientName={recipient.display_name}
            recipientAvatar={recipient.avatar_url || undefined}
          />
        </Card>
      </div>
    </div>
  )
}
