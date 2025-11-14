import { createBrowserClient } from "@supabase/ssr"
import { useMemo } from "react"

// Create a memoized Supabase client to prevent recreating the client on every render.
function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    const missing = []
    if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    throw new Error(`Missing required environment variables for browser Supabase client: ${missing.join(', ')}. These must be prefixed with NEXT_PUBLIC_ to be accessible in the browser.`)
  }

  return createBrowserClient(url, anonKey)
}

function useSupabaseBrowserClient() {
  return useMemo(createSupabaseClient, [])
}

export default useSupabaseBrowserClient
