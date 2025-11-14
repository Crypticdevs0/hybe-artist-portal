import { createBrowserClient } from "@supabase/ssr"
import { useMemo } from "react"

// Create a memoized Supabase client to prevent recreating the client on every render.
function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Missing Supabase URL or Anon Key for browser Supabase client')
  }

  return createBrowserClient(url, anonKey)
}

function useSupabaseBrowserClient() {
  return useMemo(createSupabaseClient, [])
}

export default useSupabaseBrowserClient
