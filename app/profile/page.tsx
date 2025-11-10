import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { ProfileSection } from "@/components/profile-section"
import { UserIcon } from "lucide-react"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <DashboardNav userRole={profile.role} />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Profile</h1>
        </div>

        <ProfileSection profile={profile} />
      </div>
    </div>
  )
}
