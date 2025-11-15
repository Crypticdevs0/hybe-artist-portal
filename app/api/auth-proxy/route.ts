import { handleAuthProxy } from "@/lib/supabase/auth-handler"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  return await handleAuthProxy(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
