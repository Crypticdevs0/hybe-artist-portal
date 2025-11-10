"use client"

import dynamic from "next/dynamic"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/file-upload"
const Mail = dynamic(() => import("lucide-react").then((m) => m.Mail), { ssr: false })
const Calendar = dynamic(() => import("lucide-react").then((m) => m.Calendar), { ssr: false })
const Upload = dynamic(() => import("lucide-react").then((m) => m.Upload), { ssr: false })
import { format } from "date-fns"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { logError } from "@/lib/error-logger"

interface ProfileSectionProps {
  profile: {
    id: string
    display_name: string
    email: string
    avatar_url?: string
    bio?: string
    subscription_tier: string
    role: string
    created_at: string
    subscription_expiry?: string
  }
}

export function ProfileSection({ profile: initialProfile }: ProfileSectionProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false)
  const { toast } = useToast()

  const subscriptionBadgeColor = {
    basic: "bg-muted-foreground",
    premium: "gradient-hybe text-white",
    vip: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
  }[profile.subscription_tier]

  const handleAvatarUpload = async (url: string) => {
    setIsUpdatingAvatar(true)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", profile.id)

      if (error) throw error

      setProfile({ ...profile, avatar_url: url })
      toast({
        title: "Avatar updated!",
        description: "Your profile picture has been changed.",
      })
    } catch (error) {
      logError("update_avatar", error, { user_id: profile.id })
      toast({
        variant: "destructive",
        title: "Failed to update avatar",
        description: "Please try again.",
      })
    } finally {
      setIsUpdatingAvatar(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className="flex flex-col items-center gap-3 w-full sm:w-auto">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-primary/10 shrink-0">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-xl sm:text-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold">
                  {profile.display_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="sm"
                className="border-primary/20 hover:bg-primary/5 bg-transparent text-xs w-full sm:w-auto"
                disabled={isUpdatingAvatar}
              >
                <Upload className="h-3 w-3 mr-1.5" />
                Change Avatar
              </Button>
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{profile.display_name}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={subscriptionBadgeColor}>{profile.subscription_tier.toUpperCase()}</Badge>
                  {profile.role !== "member" && (
                    <Badge variant="outline" className="border-primary text-primary">
                      {profile.role.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                  Member since {format(new Date(profile.created_at), "MMMM yyyy")}
                </div>
              </div>

              {profile.bio && (
                <div className="pt-4 border-t border-border/40">
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border/40">
            <p className="text-sm font-semibold mb-3 text-foreground">Update Avatar</p>
            <FileUpload
              onUpload={handleAvatarUpload}
              accept="image/*"
              label="Upload profile picture"
              disabled={isUpdatingAvatar}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Subscription Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <p className="font-semibold text-sm sm:text-base">Current Plan</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                {profile.subscription_tier === "basic" && "Free access to public content"}
                {profile.subscription_tier === "premium" && "Access to premium content"}
                {profile.subscription_tier === "vip" && "Full access to all exclusive content"}
              </p>
            </div>
            <Badge className={`${subscriptionBadgeColor} shrink-0`}>
              {profile.subscription_tier.toUpperCase()}
            </Badge>
          </div>

          {profile.subscription_expiry && (
            <div className="pt-4 border-t border-border/40">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Subscription expires: {format(new Date(profile.subscription_expiry), "PPP")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
