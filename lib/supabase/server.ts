import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * createClient - server-side Supabase client that uses server-only env variables.
 * Uses SUPABASE_URL and SUPABASE_ANON_KEY (no NEXT_PUBLIC_ prefix) so the values
 * are not accidentally bundled to the client. For privileged operations, use
 * createServiceRoleClient which uses SUPABASE_SERVICE_ROLE_KEY.
 */
export async function createClient() {
  const cookieStore = await cookies()

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Supabase URL or Anon key is not configured on the server (SUPABASE_URL / SUPABASE_ANON_KEY)')
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

/**
 * createServiceRoleClient - server-only elevated Supabase client. Use this only
 * in trusted server environments (not in routes that accept arbitrary user input)
 * and avoid exposing the service role key to the client.
 */
export function createServiceRoleClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Supabase URL or SERVICE ROLE key is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)')
  }

  return createServerClient(url, serviceKey)
}
