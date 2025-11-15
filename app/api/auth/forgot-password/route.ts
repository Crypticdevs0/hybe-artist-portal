import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { limitWithUpstash } from '@/lib/upstash-rate-limit'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const resetLimiter = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(3, '3600 s'), // 3 reset attempts per hour per email
    })
  : null

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const emailKey = `password-reset:${email}`
    const rateLimitResult = await limitWithUpstash(resetLimiter, emailKey, 3, 3600)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many password reset attempts for this email. Please try again later.',
          retryAfter: rateLimitResult.reset ? Math.ceil((rateLimitResult.reset - Date.now()) / 1000) : 3600
        },
        { status: 429 }
      )
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${request.headers.get('origin')}/auth/reset-password`,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({ 
      message: 'If an account exists with this email, a password reset link has been sent.' 
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
}
