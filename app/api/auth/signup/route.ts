import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { limitWithUpstash } from '@/lib/upstash-rate-limit'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const signupLimiter = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(3, '3600 s'), // 3 signups per hour per IP
    })
  : null

const emailLimiter = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(2, '3600 s'), // 2 signups per hour per email
    })
  : null

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'
    const ipKey = `signup:${ip}`

    const ipRateLimitResult = await limitWithUpstash(signupLimiter, ipKey, 3, 3600)
    if (!ipRateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many signup attempts from this IP. Please try again later.',
          retryAfter: ipRateLimitResult.reset ? Math.ceil((ipRateLimitResult.reset - Date.now()) / 1000) : 3600
        },
        { status: 429 }
      )
    }

    const { email, password, displayName } = await request.json()

    if (!email || !password || !displayName) {
      return NextResponse.json(
        { error: 'Email, password, and display name are required' },
        { status: 400 }
      )
    }

    const emailKey = `signup:email:${email}`
    const emailRateLimitResult = await limitWithUpstash(emailLimiter, emailKey, 2, 3600)
    if (!emailRateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many signup attempts for this email. Please try again later.',
          retryAfter: emailRateLimitResult.reset ? Math.ceil((emailRateLimitResult.reset - Date.now()) / 1000) : 3600
        },
        { status: 429 }
      )
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${request.headers.get('origin')}/auth/callback`,
        data: {
          display_name: displayName,
        },
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ user: data.user })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An error occurred while creating your account' },
      { status: 500 }
    )
  }
}
