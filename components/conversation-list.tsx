"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"

interface Conversation {
  id: string
  other_user: {
    id: string
    display_name: string
    avatar_url?: string
    role: string
  }
  last_message?: {
    content: string
    created_at: string
    sender_id: string
  }
  unread_count: number
}

interface ConversationListProps {
  conversations: Conversation[]
  currentUserId: string
}

export function ConversationList({ conversations, currentUserId }: ConversationListProps) {
  const router = useRouter()

  return (
    <div className="space-y-2 sm:space-y-3">
      {conversations.map((conversation) => {
        const isUnread = conversation.unread_count > 0
        const isFromOther = conversation.last_message?.sender_id !== currentUserId

        return (
          <Card
            key={conversation.id}
            className={`p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
              isUnread && isFromOther
                ? "bg-primary/5 border-primary/20 shadow-sm"
                : "border-primary/10 hover:bg-accent/5"
            }`}
            onClick={() => router.push(`/messages/${conversation.other_user.id}`)}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 sm:h-12 sm:w-12 ring-2 ring-primary/10">
                <AvatarImage src={conversation.other_user.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold text-sm">
                  {conversation.other_user.display_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <p
                      className={`font-semibold text-sm sm:text-base truncate ${isUnread && isFromOther ? "text-primary" : ""}`}
                    >
                      {conversation.other_user.display_name}
                    </p>
                    {conversation.other_user.role === "artist" && (
                      <Badge variant="outline" className="border-primary text-primary text-xs shrink-0">
                        Artist
                      </Badge>
                    )}
                  </div>
                  {conversation.last_message && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                    </span>
                  )}
                </div>

                {conversation.last_message && (
                  <div className="flex items-center justify-between mt-1 gap-2">
                    <p
                      className={`text-xs sm:text-sm truncate ${isUnread && isFromOther ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                    >
                      {conversation.last_message.sender_id === currentUserId && "You: "}
                      {conversation.last_message.content}
                    </p>
                    {isUnread && isFromOther && conversation.unread_count > 0 && (
                      <Badge className="gradient-hybe text-white h-5 min-w-5 flex items-center justify-center text-xs shrink-0">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
