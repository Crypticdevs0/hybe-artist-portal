"use client"

import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { logError } from "@/lib/error-logger"

interface Comment {
  id: string
  content: string
  created_at: string
  user: {
    id: string
    display_name: string
    avatar_url?: string
    role: string
  }
}

interface CommentSectionProps {
  postId: string
  comments: Comment[]
  currentUserId: string
  onCommentAdded?: () => void
}

export function CommentSection({
  postId,
  comments: initialComments,
  currentUserId,
  onCommentAdded,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: currentUserId,
          content: newComment.trim(),
        })
        .select(`
          *,
          user:profiles!comments_user_id_fkey (
            id,
            display_name,
            avatar_url,
            role
          )
        `)
        .single()

      if (error) throw error

      setComments([data, ...comments])
      setNewComment("")
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully.",
      })
      onCommentAdded?.()
    } catch (error) {
      logError("add_comment", error, { post_id: postId, user_id: currentUserId })
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to post comment. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px] resize-none focus-visible:ring-primary"
        />
        {newComment.length > 0 && (
          <p className="text-xs text-muted-foreground text-right">{newComment.length} characters</p>
        )}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            size="sm"
            className="gradient-hybe text-white hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-xl bg-secondary/20 border border-border/40">
            <p className="text-sm text-muted-foreground mb-1">No comments yet</p>
            <p className="text-xs text-muted-foreground">Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment, index) => (
            <div
              key={comment.id}
              className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-top-2"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-border/20">
                <AvatarImage src={comment.user.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-xs font-semibold">
                  {comment.user.display_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="bg-secondary/50 rounded-lg px-3 py-2 border border-border/40">
                  <p className="font-semibold text-sm text-foreground">{comment.user.display_name}</p>
                  <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap break-words">{comment.content}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-3">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
