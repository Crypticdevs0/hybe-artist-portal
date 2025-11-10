"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2 } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface PostCardProps {
  post: {
    id: string
    title: string
    content: string
    media_url?: string
    created_at: string
    artist: {
      stage_name: string
      profile: {
        avatar_url?: string
      }
    }
    likes: { id: string }[]
    comments: { id: string }[]
    user_liked: boolean
  }
  onLike?: () => void
  onComment?: () => void
}

export function PostCard({ post, onLike, onComment }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.user_liked)
  const [likeCount, setLikeCount] = useState(post.likes.length)
  const [isLiking, setIsLiking] = useState(false)
  const { toast } = useToast()

  const handleLike = async () => {
    if (isLiking) return
    setIsLiking(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    try {
      if (isLiked) {
        await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", user.id)
        setLikeCount((prev) => prev - 1)
        setIsLiked(false)
      } else {
        await supabase.from("likes").insert({ post_id: post.id, user_id: user.id })
        setLikeCount((prev) => prev + 1)
        setIsLiked(true)
        toast({
          title: "Liked!",
          description: `You liked ${post.artist.stage_name}'s post`,
          duration: 2000,
        })
      }
      onLike?.()
    } catch (error) {
      console.error("Error toggling like:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to like post. Please try again.",
      })
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <Card className="border-primary/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur-sm animate-in fade-in-0 slide-in-from-bottom-4">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-primary/10 transition-all hover:ring-primary/30">
            <AvatarImage src={post.artist.profile.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
              {post.artist.stage_name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm sm:text-base truncate">{post.artist.stage_name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-2 text-balance">{post.title}</h3>
          <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        </div>
        {post.media_url && (
          <img
            src={post.media_url || "/placeholder.svg"}
            alt={post.title}
            className="rounded-xl w-full object-cover max-h-80 sm:max-h-96 transition-all duration-300 hover:scale-[1.02]"
            loading="lazy"
          />
        )}
      </CardContent>
      <CardFooter className="flex gap-2 sm:gap-4 border-t border-border/40 pt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isLiking}
          className={`${isLiked ? "text-primary" : ""} hover:bg-primary/5 flex-1 sm:flex-none transition-all duration-200 ${isLiked ? "scale-110" : ""}`}
        >
          <Heart
            className={`h-4 w-4 mr-1 sm:mr-2 transition-all ${isLiked ? "fill-current animate-in zoom-in-50" : ""}`}
          />
          <span className="text-xs sm:text-sm font-medium">{likeCount}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onComment}
          className="hover:bg-primary/5 flex-1 sm:flex-none transition-colors"
        >
          <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="text-xs sm:text-sm">{post.comments.length}</span>
        </Button>
        <Button variant="ghost" size="sm" className="hover:bg-primary/5 flex-1 sm:flex-none transition-colors">
          <Share2 className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="text-xs sm:text-sm hidden sm:inline">Share</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
