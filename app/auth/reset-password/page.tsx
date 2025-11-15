"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useSupabaseBrowserClient from "@/lib/supabase/client"
import { logError } from "@/lib/error-logger"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordRequirements } from "@/components/password-requirements"
import Icon from "@/components/ui/icon"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = useSupabaseBrowserClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // Here you can handle the password recovery event
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (!isPasswordValid) {
      setError("Please meet all password requirements")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setMessage("Your password has been reset successfully.")
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reset password"
      setError(errorMessage)
      logError("reset_password_error", error, {
        errorMessage,
        timestamp: new Date().toISOString(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4 sm:mb-6">
            <Icon name="Sparkles" className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              HYBE
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Artist Communication Portal</p>
        </div>
        <Card className="border-primary/10 shadow-xl">
          <CardHeader className="space-y-2 sm:space-y-3 pb-6">
            <CardTitle className="text-2xl sm:text-3xl">Set New Password</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Please enter a new password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {password && <PasswordRequirements password={password} onValidityChange={setIsPasswordValid} />}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password">Confirm New Password</Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                </div>
                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-700 dark:text-green-400">
                    {message}
                  </div>
                )}
                <Button type="submit" className="w-full gradient-hybe text-white" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
