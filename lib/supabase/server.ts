import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { env } from "@/lib/env.mjs"

/**
 * createClient - server-side Supabase client that uses server-only env variables.
 * Uses SUPABASE_URL and SUPABASE_ANON_KEY (no NEXT_PUBLIC_ prefix) so the values
 * are not accidentally bundled to the client. For privileged operations, use
 * createServiceRoleClient which uses SUPABASE_SERVICE_ROLE_KEY.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
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
  // Provide minimal cookie methods required by the server client types.
  // Service role client runs in trusted server environments and does not
  // rely on request cookies, so getAll returns an empty array and setAll is a no-op.
  return createServerClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {},
    },
  })
}
