"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { logError } from "@/lib/error-logger"

interface CreatePostDialogProps {
  artistId: string
}

export function CreatePostDialog({ artistId }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [visibility, setVisibility] = useState("all")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const isTitleValid = title.trim().length >= 3
  const isContentValid = content.trim().length >= 10
  const canSubmit = isTitleValid && isContentValid && !isSubmitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("posts").insert({
        artist_id: artistId,
        title: title.trim(),
        content: content.trim(),
        visibility,
      })

      if (error) throw error

      toast({
        title: "Post published!",
        description: "Your post has been shared with your fans.",
      })

      setOpen(false)
      setTitle("")
      setContent("")
      setVisibility("all")
      router.refresh()
    } catch (error) {
      logError("create_post", error, { artist_id: artistId, visibility })
      toast({
        variant: "destructive",
        title: "Failed to publish",
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-hybe text-white hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>Share updates and exclusive content with your fans</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={title.length > 0 && !isTitleValid ? "border-destructive" : ""}
            />
            {title.length > 0 && (
              <p className={`text-xs ${isTitleValid ? "text-muted-foreground" : "text-destructive"}`}>
                {title.length} characters {!isTitleValid && "(minimum 3)"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`min-h-[200px] resize-none ${content.length > 0 && !isContentValid ? "border-destructive" : ""}`}
              required
            />
            {content.length > 0 && (
              <p className={`text-xs ${isContentValid ? "text-muted-foreground" : "text-destructive"}`}>
                {content.length} characters {!isContentValid && "(minimum 10)"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                <SelectItem value="premium">Premium & VIP Only</SelectItem>
                <SelectItem value="vip">VIP Only</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Control who can see this post based on subscription tier</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="gradient-hybe text-white hover:opacity-90 transition-opacity"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Post"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
