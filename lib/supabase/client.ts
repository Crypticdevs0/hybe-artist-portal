import { createBrowserClient } from "@supabase/ssr"

// Create and cache a single browser Supabase client instance to avoid
// recreating clients on every render which can cause unstable subscriptions
// and unexpected AbortErrors when unsubscribing.
let _supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (_supabaseClient) return _supabaseClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY for browser Supabase client')
  }

  _supabaseClient = createBrowserClient(url, anonKey)
  return _supabaseClient
}
