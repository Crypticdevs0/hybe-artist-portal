"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import Icon from "@/components/ui/icon"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setMessage({
        type: "success",
        text: "Check your email for password reset instructions",
      })
      setEmail("")
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to send reset email",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 p-4 sm:p-6">
      <div className="w-full max-w-md">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mb-6 sm:mb-8"
          >
            <Icon name="ArrowLeft" className="h-4 w-4" />
            Back to login
          </Link>

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
            <CardTitle className="text-2xl sm:text-3xl">Reset Password</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Enter your email address to receive a password reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm sm:text-base">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="member@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 sm:h-11"
                  />
                </div>

                {message && (
                  <div
                    className={`rounded-lg p-3 text-sm ${
                      message.type === "success"
                        ? "bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400"
                        : "bg-destructive/10 border border-destructive/20 text-destructive"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full gradient-hybe text-white h-10 sm:h-11"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
