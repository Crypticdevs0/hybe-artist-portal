"use client"

import { useEffect, useState } from "react"
import useSupabaseBrowserClient from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Icon from "@/components/ui/icon"
import Link from "next/link"

interface ConfigStatus {
  name: string
  status: "ok" | "warning" | "error" | "unknown"
  message: string
  details?: string
}

export default function AuthDebugPage() {
  const [configs, setConfigs] = useState<ConfigStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useSupabaseBrowserClient()

  useEffect(() => {
    const checkConfig = async () => {
      const results: ConfigStatus[] = []

      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        results.push({
          name: "Supabase Client URL",
          status: supabaseUrl ? "ok" : "error",
          message: supabaseUrl ? "✓ Configured" : "✗ Not configured",
          details: supabaseUrl || "NEXT_PUBLIC_SUPABASE_URL is missing",
        })

        results.push({
          name: "Supabase Client Key",
          status: supabaseKey ? "ok" : "error",
          message: supabaseKey ? "✓ Configured" : "✗ Not configured",
          details: supabaseKey ? "Key is set (first 10 chars: " + supabaseKey.substring(0, 10) + "...)" : "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing",
        })

        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        results.push({
          name: "Current Session",
          status: session ? "ok" : "warning",
          message: session ? "✓ User logged in" : "ℹ No active session",
          details: session ? `User: ${session.user.email}` : "Expected if not logged in",
        })

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        results.push({
          name: "User Auth State",
          status: user ? "ok" : "warning",
          message: user ? "✓ User authenticated" : "ℹ User not authenticated",
          details: user ? `User ID: ${user.id}` : "Expected if not logged in",
        })

        results.push({
          name: "Browser Console",
          status: "ok",
          message: "Open browser DevTools (F12) → Console tab",
          details: "Check for any JavaScript errors or auth-related warnings",
        })

        results.push({
          name: "Email Confirmation Flow",
          status: "unknown",
          message: "Manual verification required",
          details: "After signup, check: 1) Email received? 2) Click confirmation link works? 3) Supabase dashboard for email logs",
        })

        results.push({
          name: "Redirect URL Whitelist",
          status: "warning",
          message: "Manual verification required",
          details: `Current URL: ${window.location.origin} - Check Supabase Dashboard Auth Settings to ensure this domain is whitelisted`,
        })

        results.push({
          name: "Server-side Environment Variables",
          status: "warning",
          message: "Manual verification required",
          details: "Check that SUPABASE_URL and SUPABASE_ANON_KEY are set on the server (not visible here)",
        })
      } catch (error) {
        results.push({
          name: "Configuration Check",
          status: "error",
          message: "✗ Error during check",
          details: error instanceof Error ? error.message : String(error),
        })
      }

      setConfigs(results)
      setIsLoading(false)
    }

    checkConfig()
  }, [supabase])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ok":
        return <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
      case "error":
        return <Icon name="XCircle" className="h-5 w-5 text-red-600" />
      case "warning":
        return <Icon name="AlertCircle" className="h-5 w-5 text-yellow-600" />
      default:
        return <Icon name="HelpCircle" className="h-5 w-5 text-blue-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ok":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">OK</Badge>
      case "error":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">ERROR</Badge>
      case "warning":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">WARNING</Badge>
      default:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">CHECK</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 p-4 sm:p-6">
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mb-6"
          >
            <Icon name="ArrowLeft" className="h-4 w-4" />
            Back to login
          </Link>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Icon name="Sparkles" className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                HYBE
              </h1>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">Authentication Debug Page</p>
          </div>
        </div>

        <Card className="border-primary/10 shadow-xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl">Configuration Status</CardTitle>
            <CardDescription>
              This page helps diagnose Supabase authentication issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 text-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Checking configuration...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {configs.map((config, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border/50 hover:border-border transition-colors"
                  >
                    <div className="mt-1 flex-shrink-0">{getStatusIcon(config.status)}</div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-medium text-foreground">{config.name}</h3>
                        {getStatusBadge(config.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{config.message}</p>
                      {config.details && (
                        <p className="text-xs text-muted-foreground mt-2 font-mono bg-muted p-2 rounded break-words">
                          {config.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Troubleshooting Steps</h4>
              <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li>1. <strong>Check environment variables</strong> - Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set</li>
                <li>2. <strong>Verify Supabase dashboard</strong> - Go to Settings → Auth Providers → Email and confirm email provider is configured</li>
                <li>3. <strong>Check email templates</strong> - Ensure confirmation email template uses {`{{ .ConfirmationURL }}`}</li>
                <li>4. <strong>Verify redirect URL</strong> - Add current domain to Settings → Auth → Redirect URLs in Supabase</li>
                <li>5. <strong>Check Supabase logs</strong> - Go to Logs in Supabase dashboard to see auth-related errors</li>
                <li>6. <strong>Test email delivery</strong> - Try creating a test user in Supabase dashboard and check if email is sent</li>
              </ol>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Server-side Configuration</h4>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                This debug page only checks client-side configuration. Server-side environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY) are hidden from the browser for security. Ensure they are set in your deployment platform.
              </p>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="inline-block text-sm text-primary hover:text-primary/80 underline underline-offset-4"
              >
                Return to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
