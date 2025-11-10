import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServiceRoleClient()

    // Run a minimal query against a commonly available table to verify connectivity.
    // Many parts of the app use the `profiles` table, so selecting a single id is lightweight.
    const { data, error } = await supabase.from("profiles").select("id").limit(1)

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 503 })
    }

    return NextResponse.json({ ok: true, message: "Supabase reachable", sampleCount: Array.isArray(data) ? data.length : 0 })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 })
  }
}
