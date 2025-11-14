import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"
import Link from "next/link"

export default async function ReportsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Check if user is admin
  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <DashboardNav userRole={profile?.role} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        <div className="mb-6 sm:mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mb-4"
          >
            <Icon name="ArrowLeft" className="h-4 w-4" />
            Back to Admin
          </Link>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">User & Content Reports</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Review reports and take action on violations</p>
        </div>

        {/* Report Categories */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3 mb-6 sm:mb-8">
          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <Icon name="AlertCircle" className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <Icon name="CheckCircle" className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <Icon name="Flag" className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Report Types */}
        <Card className="border-primary/10 bg-card/80 backdrop-blur-sm mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="BarChart3" className="h-5 w-5" />
              Report Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                <div>
                  <h3 className="font-semibold text-foreground">Inappropriate Content</h3>
                  <p className="text-xs text-muted-foreground mt-1">Posts or comments that violate guidelines</p>
                </div>
                <Button variant="outline" size="sm" disabled className="text-xs">
                  0 Reports
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                <div>
                  <h3 className="font-semibold text-foreground">Spam</h3>
                  <p className="text-xs text-muted-foreground mt-1">Spam messages or advertising</p>
                </div>
                <Button variant="outline" size="sm" disabled className="text-xs">
                  0 Reports
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                <div>
                  <h3 className="font-semibold text-foreground">Harassment</h3>
                  <p className="text-xs text-muted-foreground mt-1">Abuse or harassing behavior</p>
                </div>
                <Button variant="outline" size="sm" disabled className="text-xs">
                  0 Reports
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                <div>
                  <h3 className="font-semibold text-foreground">Account Issues</h3>
                  <p className="text-xs text-muted-foreground mt-1">Compromised or suspicious accounts</p>
                </div>
                <Button variant="outline" size="sm" disabled className="text-xs">
                  0 Reports
                </Button>
              </div>
            </div>

            <div className="pt-6 border-t border-border/40 mt-6">
              <p className="text-sm text-muted-foreground text-center">
                Report submission and management system coming soon
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Admin Actions */}
        <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Shield" className="h-5 w-5" />
              Available Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" disabled>
                <Icon name="Eye" className="h-4 w-4 mr-2" />
                Review Flagged Content
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <Icon name="Ban" className="h-4 w-4 mr-2" />
                Suspend User Account
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <Icon name="Trash2" className="h-4 w-4 mr-2" />
                Delete Content
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <Icon name="Mail" className="h-4 w-4 mr-2" />
                Send Warning Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
