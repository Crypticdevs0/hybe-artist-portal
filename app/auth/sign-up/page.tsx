"use client"

import type React from "react"

import useSupabaseBrowserClient from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordRequirements } from "@/components/password-requirements"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Icon from "@/components/ui/icon"
import { env } from "@/lib/env.mjs"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = useSupabaseBrowserClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${env.NEXT_PUBLIC_BASE_URL}/dashboard`,
          data: {
            display_name: displayName,
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
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
            <CardTitle className="text-2xl sm:text-3xl">Create Account</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Join to get exclusive access to your favorite artists
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-4 sm:gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="display-name" className="text-sm sm:text-base">
                    Display Name
                  </Label>
                  <Input
                    id="display-name"
                    type="text"
                    placeholder="Your name"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-10 sm:h-11"
                  />
                </div>
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
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-sm sm:text-base">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 sm:h-11"
                  />
                  {password && <PasswordRequirements password={password} onValidityChange={setIsPasswordValid} />}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password" className="text-sm sm:text-base">
                    Confirm Password
                  </Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="h-10 sm:h-11"
                  />
                </div>
                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full gradient-hybe text-white h-10 sm:h-11" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </div>
              <div className="mt-4 sm:mt-6 text-center text-sm">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
