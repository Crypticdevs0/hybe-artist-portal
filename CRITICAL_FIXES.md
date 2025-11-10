# Critical Fixes - Implementation Guide

This document provides specific code changes needed before production deployment.

---

## 1. Fix next.config.mjs (CRITICAL)

**Current Issues:**
- ESLint config deprecated in Next.js 16
- Invalid configuration options
- Build errors being hidden

**Solution:**

Replace `next.config.mjs` with:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: false,
  },
}

export default nextConfig
```

**Why:** 
- Enables image optimization (improves performance)
- Fixes deprecation warnings
- Forces TypeScript errors to be fixed properly

---

## 2. Create Password Reset Flow

Create `app/auth/forgot-password/page.tsx`:

```typescript
"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { Sparkles, ArrowLeft } from "lucide-react"

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
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4 sm:mb-6">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
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
```

Create `app/auth/reset-password/page.tsx`:

```typescript
"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordRequirements } from "@/components/password-requirements"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Sparkles } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
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
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      router.push("/auth/login?reset=success")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4 sm:mb-6">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
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
              Enter your new password to regain access to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4 sm:gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-sm sm:text-base">
                    New Password
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
                  <Label htmlFor="confirm-password" className="text-sm sm:text-base">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10 sm:h-11"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full gradient-hybe text-white h-10 sm:h-11"
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>

              <div className="mt-4 sm:mt-6 text-center text-sm">
                Remember your password?{" "}
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
```

Update `app/auth/login/page.tsx` - Add forgot password link:

```typescript
// In the CardContent form, after the error div, add:
<div className="text-right">
  <Link
    href="/auth/forgot-password"
    className="text-xs sm:text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
  >
    Forgot password?
  </Link>
</div>
```

---

## 3. Replace console.error with Proper Error Tracking

### Option A: Using Sentry (Recommended)

Install Sentry:
```bash
npm install @sentry/nextjs
```

Update `app/layout.tsx`:
```typescript
import { Sentry } from "@/lib/sentry"

// Wrap your app with Sentry
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Sentry.ErrorBoundary>
          <Toaster />
          <Analytics />
        </Sentry.ErrorBoundary>
      </body>
    </html>
  )
}
```

Create `lib/sentry.ts`:
```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === "production",
})

export { Sentry }
```

Update components to use Sentry:
```typescript
// Replace:
console.error("Error toggling like:", error)

// With:
import { Sentry } from "@/lib/sentry"
Sentry.captureException(error, {
  contexts: {
    action: {
      action_name: "toggle_like",
      post_id: post.id,
    },
  },
})
```

### Option B: Simple Error Logging Service

Create `lib/error-logger.ts`:
```typescript
export async function logError(
  context: string,
  error: unknown,
  metadata?: Record<string, unknown>
) {
  const errorMessage = error instanceof Error ? error.message : String(error)

  // Log to your error tracking service
  if (process.env.NODE_ENV === "production") {
    try {
      await fetch("/api/logs/error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          message: errorMessage,
          timestamp: new Date().toISOString(),
          metadata,
        }),
      })
    } catch {
      // Silently fail - don't create infinite loop
    }
  } else {
    console.error(`[${context}]`, error)
  }
}
```

---

## 4. Update TypeScript

```bash
npm install typescript@latest --save-dev
```

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "dom", "dom.iterable"],
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## 5. Verify Database Setup

Execute in Supabase SQL Editor (in order):

### Step 1: Execute table creation script
```sql
-- scripts/001_create_tables.sql
-- Copy entire contents and execute
```

### Step 2: Execute functions and triggers
```sql
-- scripts/002_create_functions.sql
-- Copy entire contents and execute
```

### Step 3: Add performance indexes
```sql
CREATE INDEX IF NOT EXISTS idx_messages_recipient 
ON messages(recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_sender 
ON messages(sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_artist 
ON posts(artist_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_visibility 
ON posts(visibility, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user 
ON notifications(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);

CREATE INDEX IF NOT EXISTS idx_comments_post 
ON comments(post_id, created_at DESC);
```

### Step 4: Verify RLS is enabled
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
-- All should have rowsecurity = true
```

---

## 6. Test Build Locally

```bash
# Clean build
rm -rf .next
npm run build

# Test production build
npm run start

# Visit http://localhost:3000 and test all flows
```

---

## 7. Environment Variables for Production

When deploying to Vercel, ensure these are set:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn (optional)
```

Do NOT set:
- SUPABASE_POSTGRES_URL (sensitive - server only)
- SUPABASE_JWT_SECRET (sensitive - server only)

---

## Verification Checklist

After applying all fixes:

- [ ] next.config.mjs updated
- [ ] TypeScript upgraded to v5.1.0+
- [ ] Password reset pages created
- [ ] Error tracking implemented
- [ ] npm run build succeeds (0 errors)
- [ ] Database migrations executed
- [ ] RLS policies verified
- [ ] Performance indexes created
- [ ] Production environment variables configured
- [ ] Test signup and email flow
- [ ] Test password reset flow
- [ ] Test login with credentials
- [ ] Test real-time messaging
- [ ] Verify dark mode works
- [ ] Mobile responsiveness checked

---

**Estimated Time to Complete:** 4-6 hours  
**Deployment Ready After:** All items above verified
