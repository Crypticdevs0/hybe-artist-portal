import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Flag, AlertCircle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default async function AdminReportsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Placeholder for reports - in a full implementation, this would query from a reports table
  const reports: any[] = []

  const reportStats = {
    pending: reports.filter((r) => r.status === "pending").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    total: reports.length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <DashboardNav userRole={profile?.role} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        <Button asChild variant="ghost" size="sm" className="mb-4 hover:bg-primary/10">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Link>
        </Button>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Reports & Flags</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Review user reports and content flags</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3 mb-6 sm:mb-8">
          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{reportStats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{reportStats.pending}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <Flag className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{reportStats.resolved}</div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>User Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {reports && reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report: any) => (
                  <div
                    key={report.id}
                    className="flex flex-col gap-3 border-b border-border/40 pb-4 last:border-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm sm:text-base text-foreground">{report.reason}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Reported by {report.reporter_name || "Anonymous"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs shrink-0 ${
                            report.status === "pending" ? "bg-amber-500/10" : "bg-green-500/10"
                          }`}
                        >
                          {report.status || "pending"}
                        </Badge>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {format(new Date(report.created_at), "MMM dd")}
                        </Badge>
                      </div>
                    </div>
                    {report.description && (
                      <p className="text-sm text-foreground bg-muted/30 rounded p-3 break-words">
                        {report.description}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
                        Review
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400"
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <Flag className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm sm:text-base text-muted-foreground">No reports at this time</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">All systems nominal</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
