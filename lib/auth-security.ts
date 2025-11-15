import { SupabaseClient } from '@supabase/supabase-js'
import crypto from 'crypto'

/**
 * Check if user's email is verified
 * Returns true only if email is confirmed
 */
export async function isEmailVerified(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.admin?.getUserById(userId)
    || { data: { user: null } }

  if (!user) {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (currentUser?.id !== userId) return false
    return currentUser?.email_confirmed_at !== null
  }

  return user?.email_confirmed_at !== null
}

/**
 * Require email verification before allowing access to protected resources
 */
export async function requireEmailVerification(
  supabase: SupabaseClient
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  if (!user.email_confirmed_at) {
    throw new Error('Email verification required')
  }

  return true
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) return false

  try {
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(sessionToken)
    )
  } catch {
    return false
  }
}

/**
 * Session timeout configuration (in milliseconds)
 */
export const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

/**
 * Calculate session timeout
 */
export function getSessionTimeout(lastActivityTime: number): number {
  const elapsed = Date.now() - lastActivityTime
  const remaining = SESSION_TIMEOUT - elapsed
  return Math.max(0, remaining)
}

/**
 * Check if session has timed out
 */
export function isSessionTimedOut(lastActivityTime: number): boolean {
  return getSessionTimeout(lastActivityTime) <= 0
}

/**
 * Password validation regex - requires:
 * - At least 8 characters
 * - One uppercase letter
 * - One lowercase letter
 * - One number
 * - One special character
 */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
