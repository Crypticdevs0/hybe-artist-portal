import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { limitWithUpstash } from '@/lib/upstash-rate-limit'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const loginLimiter = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(5, '60 s'), // 5 attempts per minute
    })
  : null

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'
    const key = `login:${ip}`

    const rateLimitResult = await limitWithUpstash(loginLimiter, key, 5, 60)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          retryAfter: rateLimitResult.reset ? Math.ceil((rateLimitResult.reset - Date.now()) / 1000) : 60
        },
        { status: 429 }
      )
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json({ user: data.user, session: data.session })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred while logging in' },
      { status: 500 }
    )
  }
}
