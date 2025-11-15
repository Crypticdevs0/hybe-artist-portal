import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import Icon from "@/components/ui/icon"
import { Breadcrumb } from "@/components/breadcrumb"

export const revalidate = 30 // revalidate every 30 seconds

export default async function NotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  const iconMap: Record<string, string> = {
    message: "MessageCircle",
    comment: "MessageCircle",
    like: "Heart",
    new_post: "FileText",
    system: "AlertCircle",
  }

  const colorMap = {
    message: "text-chart-1",
    comment: "text-primary",
    like: "text-destructive",
    new_post: "text-chart-2",
    system: "text-chart-3",
  }

  const bgMap = {
    message: "bg-chart-1/10",
    comment: "bg-primary/10",
    like: "bg-destructive/10",
    new_post: "bg-chart-2/10",
    system: "bg-chart-3/10",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <DashboardNav userRole={profile?.role} />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Notifications" },
          ]}
        />
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Icon name="Bell" className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Notifications</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Stay updated with your latest activity</p>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {!notifications || notifications.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center border-primary/10 bg-card/50 backdrop-blur-sm">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
                <Icon name="Bell" className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <p className="text-base sm:text-lg font-semibold mb-2 text-foreground">No notifications yet</p>
              <p className="text-sm text-muted-foreground">We&apos;ll notify you when something important happens</p>
            </Card>
          ) : (
            notifications.map((notification, index) => {
              const IconName = iconMap[notification.type as keyof typeof iconMap] || "Bell"
              const color = colorMap[notification.type as keyof typeof colorMap] || "text-muted-foreground"
              const bgColor = bgMap[notification.type as keyof typeof bgMap] || "bg-secondary"

              return (
                <Card
                  key={notification.id}
                  className={`border-primary/10 bg-card/80 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 animate-in fade-in-0 slide-in-from-top-2 ${
                    notification.is_read ? "" : "ring-2 ring-primary/20"
                  }`}
                  style={{
                    animationDelay: `${index * 30}ms`,
                  }}
                >
                  <CardContent className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4">
                    <div
                      className={`flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full ${bgColor} ${color}`}
                    >
                      <Icon name={IconName} className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base text-foreground">{notification.title}</p>
                      {notification.content && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                          {notification.content}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.is_read && <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
