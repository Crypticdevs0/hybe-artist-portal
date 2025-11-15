"use client"

import type React from "react"
import dynamic from "next/dynamic"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
const Send = dynamic(() => import("lucide-react").then((m) => m.Send), { ssr: false })
const AlertCircle = dynamic(() => import("lucide-react").then((m) => m.AlertCircle), { ssr: false })
const FileText = dynamic(() => import("lucide-react").then((m) => m.FileText), { ssr: false })
const Play = dynamic(() => import("lucide-react").then((m) => m.Play), { ssr: false })
const Music = dynamic(() => import("lucide-react").then((m) => m.Music), { ssr: false })
const Image = dynamic(() => import("lucide-react").then((m) => m.Image), { ssr: false })
const Paperclip = dynamic(() => import("lucide-react").then((m) => m.Paperclip), { ssr: false })
import { useState, useEffect, useRef } from "react"
import useSupabaseBrowserClient from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
const Loader2 = dynamic(() => import("lucide-react").then((m) => m.Loader2), { ssr: false })
import { logError } from "@/lib/error-logger"
import { ChatFileUpload, type UploadedFile } from "@/components/chat-file-upload"

interface Attachment {
  id?: string
  file_name: string
  file_size: number
  file_type: string
  storage_path: string
  url?: string
}

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  attachments?: Attachment[]
}

const isMessage = (value: unknown): value is Message => {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === "string" &&
    typeof v.content === "string" &&
    typeof v.sender_id === "string" &&
    typeof v.created_at === "string"
  )
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
  const [isConnected, setIsConnected] = useState(true)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [tempMessageId, setTempMessageId] = useState<string | null>(null)
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([])
  const [isRecipientTyping, setIsRecipientTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = useSupabaseBrowserClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Subscribe to new messages and typing indicators
    const channel = supabase
      .channel(`messages-${currentUserId}-${recipientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${recipientId},recipient_id=eq.${currentUserId}`,
        },
        (payload: { new: unknown }) => {
          const next = payload.new
          if (isMessage(next)) {
            setMessages((prev) => [...prev, next])
            // Mark message as read (fire-and-forget)
            void supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", next.id)
          }
          setIsConnected(true)
        },
      )
      .on(
        "broadcast",
        { event: "typing" },
        (payload: { payload: { typing: boolean } }) => {
          if (payload.payload.typing) {
            setIsRecipientTyping(true)
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current)
            }
            typingTimeoutRef.current = setTimeout(() => {
              setIsRecipientTyping(false)
            }, 3000)
          }
        }
      )
      .on("system", { event: "database_changes.confirm" }, () => {
        setIsConnected(true)
      })
      .subscribe((status: string) => {
        setIsConnected(status === "SUBSCRIBED")
      })

    return () => {
      supabase.removeChannel(channel)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [currentUserId, recipientId, supabase])

  // Auto-resize textarea
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px"
    }

    // Broadcast typing indicator
    supabase
      .channel(`messages-${currentUserId}-${recipientId}`)
      .send({
        type: "broadcast",
        event: "typing",
        payload: { typing: true },
      })
      .catch(() => {
        // Silent fail - typing indicator is not critical
      })
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!newMessage.trim() && attachedFiles.length === 0) || isSending || !isConnected) return

    setIsSending(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: currentUserId,
          recipient_id: recipientId,
          content: newMessage.trim() || (attachedFiles.length > 0 ? "[Shared a file]" : ""),
        })
        .select()
        .single()

      if (error) throw error

      if (isMessage(data)) {
        setMessages((prev) => [...prev, data])
      }
      setNewMessage("")
      setAttachedFiles([])
      setShowFileUpload(false)
      setTempMessageId(null)
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    } catch (err) {
      logError("send_message", err, { recipient_id: recipientId })
      setError("Failed to send message. Please check your connection and try again.")
    } finally {
      setIsSending(false)
    }
  }

  const handleFileUpload = (file: UploadedFile) => {
    setAttachedFiles((prev) => [...prev, file])
  }

  const handleUploadError = (errorMsg: string) => {
    setError(errorMsg)
  }

  const toggleFileUpload = async () => {
    if (!showFileUpload) {
      try {
        const { data, error } = await supabase
          .from("messages")
          .insert({
            sender_id: currentUserId,
            recipient_id: recipientId,
            content: "[Preparing message...]",
          })
          .select()
          .single()

        if (error) throw error
        if (isMessage(data)) {
          setTempMessageId(data.id)
          setShowFileUpload(true)
        }
      } catch (err) {
        logError("create_message_for_upload", err, { recipient_id: recipientId })
        setError("Failed to prepare file upload")
      }
    } else {
      setShowFileUpload(false)
      if (tempMessageId && attachedFiles.length === 0) {
        try {
          await supabase
            .from("messages")
            .delete()
            .eq("id", tempMessageId)
        } catch (err) {
          console.warn("Failed to clean up temporary message:", err)
        }
      }
      setTempMessageId(null)
    }
  }

  return (
    <div className="flex flex-col h-full rounded-lg border border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <div className="inline-block p-3 sm:p-4 rounded-full bg-primary/10 mb-3">
                <Send className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation with {recipientName}!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUserId

            return (
              <div key={message.id} className={`flex items-end gap-2 sm:gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
                {!isOwn && (
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 ring-1 ring-primary/10">
                    <AvatarImage src={recipientAvatar || undefined} alt={recipientName} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-xs font-semibold">
                      {recipientName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`flex flex-col gap-1 ${isOwn ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[75%]`}>
                  <div
                    className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 break-words ${
                      isOwn
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "bg-muted text-foreground border border-primary/5"
                    }`}
                  >
                    {message.content && (
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    )}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment, idx) => (
                          <a
                            key={`${attachment.storage_path}-${idx}`}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 text-xs px-2 py-1 rounded transition-opacity hover:opacity-80 ${
                              isOwn
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {attachment.file_type.startsWith("image/") && (
                              <Image className="h-3 w-3 flex-shrink-0" />
                            )}
                            {attachment.file_type.startsWith("video/") && (
                              <Play className="h-3 w-3 flex-shrink-0" />
                            )}
                            {attachment.file_type.startsWith("audio/") && (
                              <Music className="h-3 w-3 flex-shrink-0" />
                            )}
                            {!attachment.file_type.startsWith("image/") &&
                              !attachment.file_type.startsWith("video/") &&
                              !attachment.file_type.startsWith("audio/") && (
                                <FileText className="h-3 w-3 flex-shrink-0" />
                              )}
                            <span className="truncate">{attachment.file_name}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground px-1">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            )
          })
        )}
        {isRecipientTyping && (
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 ring-1 ring-primary/10">
              <AvatarImage src={recipientAvatar || undefined} alt={recipientName} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-xs font-semibold">
                {recipientName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-muted">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground px-1">{recipientName} is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="border-t border-primary/10 p-3 sm:p-4 bg-card/80 backdrop-blur-sm space-y-3">
        {error && (
          <div className="mb-3 p-2 sm:p-3 bg-destructive/10 text-destructive rounded-lg flex items-start gap-2 text-xs sm:text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!isConnected && (
          <div className="mb-3 p-2 sm:p-3 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 rounded-lg flex items-start gap-2 text-xs sm:text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>Reconnecting to chat...</span>
          </div>
        )}

        {showFileUpload && tempMessageId && (
          <ChatFileUpload
            messageId={tempMessageId}
            onFileUpload={handleFileUpload}
            onError={handleUploadError}
            disabled={isSending}
          />
        )}

        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            placeholder={`Message ${recipientName}...`}
            value={newMessage}
            onChange={handleMessageChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend(e)
              }
            }}
            className="resize-none text-sm min-h-[44px] max-h-[120px] py-2 sm:py-3 px-3 sm:px-4"
            disabled={isSending || !isConnected}
            rows={1}
          />
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              disabled={(!newMessage.trim() && attachedFiles.length === 0) || isSending || !isConnected}
              className="gradient-hybe text-white hover:opacity-90 shrink-0"
              size="icon"
              title={isSending ? "Sending..." : "Send message (Enter)"}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
            <Button
              type="button"
              onClick={toggleFileUpload}
              disabled={isSending || !isConnected}
              variant={showFileUpload ? "default" : "outline"}
              className="shrink-0"
              size="icon"
              title={showFileUpload ? "Hide file upload" : "Attach files"}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground px-1">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  )
}
