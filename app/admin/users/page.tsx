import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { getUser } from "@/lib/get-user"

export default async function AdminUsersPage() {
  const user = await getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const supabase = await createClient()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Get all users
  const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  const roleColors = {
    admin: "bg-red-500",
    artist: "bg-purple-500",
    member: "bg-blue-500",
  }

  const tierColors = {
    vip: "bg-amber-500",
    premium: "bg-purple-500",
    basic: "bg-gray-500",
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav userRole={profile?.role} />

      <div className="mx-auto max-w-7xl px-4 py-4 md:py-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Link>
        </Button>

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1 md:mt-2">View and manage all platform users</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users ({users?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users?.map((userProfile) => (
                <div
                  key={userProfile.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 last:border-0"
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <Avatar className="h-10 w-10 md:h-12 md:w-12 shrink-0">
                      <AvatarImage src={userProfile.avatar_url || undefined} />
                      <AvatarFallback>{userProfile.display_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-sm md:text-base truncate">{userProfile.display_name}</p>
                        <Badge className={`${roleColors[userProfile.role as keyof typeof roleColors]} text-xs`}>
                          {userProfile.role.toUpperCase()}
                        </Badge>
                        <Badge
                          className={`${tierColors[userProfile.subscription_tier as keyof typeof tierColors]} text-xs`}
                        >
                          {userProfile.subscription_tier.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">{userProfile.email}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                        Joined {format(new Date(userProfile.created_at), "PPP")}
                      </p>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full md:w-auto bg-transparent">
                    Manage
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
