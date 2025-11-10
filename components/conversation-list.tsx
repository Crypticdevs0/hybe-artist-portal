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
    <div className="grid gap-2 sm:gap-3">
      {conversations.map((conversation) => {
        const isUnread = conversation.unread_count > 0
        const isFromOther = conversation.last_message?.sender_id !== currentUserId

        return (
          <Card
            key={conversation.id}
            className={`p-3 sm:p-4 cursor-pointer transition-all duration-200 border-primary/10 ${
              isUnread && isFromOther
                ? "bg-gradient-to-r from-primary/8 to-transparent border-primary/25 shadow-sm hover:shadow-md hover:border-primary/40"
                : "bg-card/40 backdrop-blur-sm hover:bg-card/70 hover:shadow-md"
            } hover:-translate-y-0.5 active:translate-y-0`}
            onClick={() => router.push(`/messages/${conversation.other_user.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                router.push(`/messages/${conversation.other_user.id}`)
              }
            }}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative flex-shrink-0">
                <Avatar className="h-12 w-12 sm:h-13 sm:w-13 ring-2 ring-primary/15 shadow-md">
                  <AvatarImage src={conversation.other_user.avatar_url || undefined} alt={conversation.other_user.display_name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/25 to-accent/15 text-primary font-bold text-sm">
                    {conversation.other_user.display_name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isUnread && isFromOther && (
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <p
                      className={`font-semibold text-sm sm:text-base truncate ${
                        isUnread && isFromOther ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {conversation.other_user.display_name}
                    </p>
                    {conversation.other_user.role === "artist" && (
                      <Badge className="gradient-hybe text-white text-xs shrink-0 py-0 px-2">Artist</Badge>
                    )}
                  </div>
                  {conversation.last_message && (
                    <span className="text-xs sm:text-xs text-muted-foreground whitespace-nowrap flex-shrink-0 ml-1">
                      {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                    </span>
                  )}
                </div>

                {conversation.last_message ? (
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-xs sm:text-sm truncate line-clamp-2 ${
                        isUnread && isFromOther
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      <span className={isFromOther ? "" : "opacity-70"}>
                        {conversation.last_message.sender_id === currentUserId && "You: "}
                      </span>
                      {conversation.last_message.content}
                    </p>
                    {isUnread && isFromOther && conversation.unread_count > 0 && (
                      <Badge className="gradient-hybe text-white h-5 min-w-5 flex items-center justify-center text-xs shrink-0 font-bold">
                        {conversation.unread_count > 9 ? "9+" : conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No messages yet</p>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
