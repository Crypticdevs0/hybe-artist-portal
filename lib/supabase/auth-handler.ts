import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function handleAuthProxy(request: NextRequest): Promise<NextResponse> {
  return await updateSession(request)
}
