"use client"

import { useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import useSupabaseBrowserClient from '@/lib/supabase/client'
import { SESSION_TIMEOUT, isSessionTimedOut } from '@/lib/auth-security'
import { useToast } from '@/hooks/use-toast'

/**
 * Hook to manage session timeout
 * Automatically logs out user after inactivity period
 */
export function useSessionTimeout(enabled = true) {
  const router = useRouter()
  const supabase = useSupabaseBrowserClient()
  const { toast } = useToast()
  const lastActivityRef = useRef<number>(Date.now())
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningShownRef = useRef<boolean>(false)

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    toast({
      title: 'Session Expired',
      description: 'Your session has expired due to inactivity. Please sign in again.',
      variant: 'destructive',
    })
    router.push('/auth/login')
  }, [supabase, router, toast])

  const resetTimeout = useCallback(() => {
    lastActivityRef.current = Date.now()
    warningShownRef.current = false

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set timeout to warn user after 25 minutes
    timeoutRef.current = setTimeout(() => {
      if (!warningShownRef.current) {
        warningShownRef.current = true
        toast({
          title: 'Session Timeout Warning',
          description: 'Your session will expire in 5 minutes due to inactivity.',
        })
      }
    }, SESSION_TIMEOUT - 5 * 60 * 1000)

    // Set timeout to log out after 30 minutes
    const logoutTimeout = setTimeout(() => {
      handleLogout()
    }, SESSION_TIMEOUT)

    return () => clearTimeout(logoutTimeout)
  }, [toast, handleLogout])

  useEffect(() => {
    if (!enabled) return

    // Track user activity
    const handleActivity = () => {
      resetTimeout()
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach((event) => {
      document.addEventListener(event, handleActivity)
    })

    // Initial timeout
    resetTimeout()

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity)
      })
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [enabled, resetTimeout])

  return {
    lastActivity: lastActivityRef.current,
    resetActivity: resetTimeout,
  }
}
