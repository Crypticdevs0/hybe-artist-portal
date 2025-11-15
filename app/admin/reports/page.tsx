import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

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

  // Note: This feature would typically use a dedicated reports table
  // For now, we'll display a placeholder interface
  const mockReports = [
    {
      id: "1",
      type: "content",
      title: "Inappropriate Post Content",
      description: "User reported a post containing inappropriate language",
      status: "pending",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      reportedBy: "John Doe",
      reportedContent: "Artist Post #123",
    },
    {
      id: "2",
      type: "user",
      title: "Spam Account Activity",
      description: "Multiple reports of spam messages from this user",
      status: "in_review",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      reportedBy: "Jane Smith",
      reportedContent: "User: SpamBot123",
    },
    {
      id: "3",
      type: "content",
      title: "Copyright Violation",
      description: "Post contains copyrighted material without permission",
      status: "resolved",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      reportedBy: "Sarah Johnson",
      reportedContent: "Post #456",
    },
  ]

  const statusColors = {
    pending: "bg-yellow-500",
    in_review: "bg-blue-500",
    resolved: "bg-green-500",
  }

  const statusIcons = {
    pending: <Clock className="h-4 w-4" />,
    in_review: <AlertTriangle className="h-4 w-4" />,
    resolved: <CheckCircle className="h-4 w-4" />,
  }

  const reportStats = {
    total: mockReports.length,
    pending: mockReports.filter((r) => r.status === "pending").length,
    inReview: mockReports.filter((r) => r.status === "in_review").length,
    resolved: mockReports.filter((r) => r.status === "resolved").length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <DashboardNav userRole={profile?.role} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Link>
        </Button>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">User Reports</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Review and manage user-reported issues</p>
        </div>

        {/* Report Stats */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-4 mb-6 sm:mb-8">
          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{reportStats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">All reports combined</p>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{reportStats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Review</CardTitle>
              <AlertTriangle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{reportStats.inReview}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently being reviewed</p>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{reportStats.resolved}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed reviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>All Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockReports.map((report) => (
                <div
                  key={report.id}
                  className="flex flex-col gap-3 border-b border-border/40 pb-4 last:border-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="font-semibold text-sm">{report.title}</span>
                        <Badge className={`${statusColors[report.status as keyof typeof statusColors]} text-xs capitalize`}>
                          {report.status.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {report.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground mb-2">{report.description}</p>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <p>
                          <span className="font-medium">Reported by:</span> {report.reportedBy}
                        </p>
                        <p>
                          <span className="font-medium">Content:</span> {report.reportedContent}
                        </p>
                        <p>
                          <span className="font-medium">Reported:</span>{" "}
                          {report.createdAt.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <Button variant="outline" size="sm" className="bg-transparent">
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-blue-500/50 hover:bg-blue-500/10"
                    >
                      Mark as Review
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-green-500/50 hover:bg-green-500/10"
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}

              {mockReports.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">No reports found</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Note */}
        <Card className="border-primary/10 bg-card/80 backdrop-blur-sm mt-6">
          <CardContent className="pt-6">
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
              <p className="text-sm text-foreground">
                <strong>Note:</strong> The reports system currently displays sample data. To fully implement this feature,
                you'll need to:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                <li>Create a "reports" table in your Supabase database</li>
                <li>Add a report flagging feature in your app's UI</li>
                <li>Connect this admin page to the actual reports data</li>
                <li>Implement automated actions (content removal, user suspension, etc.)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
