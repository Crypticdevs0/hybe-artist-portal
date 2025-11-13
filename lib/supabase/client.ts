import { createBrowserClient } from "@supabase/ssr"
import { useMemo } from "react"
import { env } from "@/lib/env.mjs"

// Create a memoized Supabase client to prevent recreating the client on every render.
function createSupabaseClient() {
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

function useSupabaseBrowserClient() {
  return useMemo(createSupabaseClient, [])
}

export default useSupabaseBrowserClient
