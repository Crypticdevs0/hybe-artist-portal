"use client"

import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { Pointer as Spinner } from "lucide-react"

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
}

interface MessageThreadProps {
  messages: Message[]
  currentUserId: string
  recipientId: string
  recipientName: string
  recipientAvatar?: string
}

export function MessageThread({
  messages: initialMessages,
  currentUserId,
  recipientId,
  recipientName,
  recipientAvatar,
}: MessageThreadProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Subscribe to new messages
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${recipientId},recipient_id=eq.${currentUserId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, recipientId, supabase])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: currentUserId,
          recipient_id: recipientId,
          content: newMessage.trim(),
        })
        .select()
        .single()

      if (error) throw error

      setMessages((prev) => [...prev, data])
      setNewMessage("")
    } catch (err) {
      console.error("[v0] Error sending message:", err)
      setError("Failed to send message. Please check your connection and try again.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] md:h-[calc(100vh-12rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUserId

            return (
              <div key={message.id} className={`flex items-start gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
                {!isOwn && (
                  <Avatar className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0">
                    <AvatarImage src={recipientAvatar || undefined} />
                    <AvatarFallback>{recipientName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}

                <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[75%] md:max-w-[70%]`}>
                  <div
                    className={`rounded-2xl px-3 py-2 md:px-4 md:py-2 ${
                      isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-xs md:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  <span className="text-[10px] md:text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t p-3 md:p-4">
        {error && <div className="mb-2 p-2 bg-destructive/10 text-destructive text-xs rounded-lg">{error}</div>}

        <div className="flex gap-2">
          <Textarea
            placeholder={`Message ${recipientName}...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend(e)
              }
            }}
            className="min-h-[60px] resize-none text-sm"
            disabled={isSending}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="bg-primary hover:bg-primary/90 shrink-0"
            size="icon"
          >
            {isSending ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-[10px] md:text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  )
}
