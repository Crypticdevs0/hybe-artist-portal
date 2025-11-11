import { NextResponse } from 'next/server'

const requiredEnv = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'VERCEL_BLOB_TOKEN',
]

export async function GET() {
  const missing = requiredEnv.filter((k) => !process.env[k])
  if (missing.length > 0) {
    return NextResponse.json({ ok: false, missing }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
