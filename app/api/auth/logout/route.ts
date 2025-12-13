import { NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/auth'

export async function POST() {
  const expired = `${COOKIE_NAME}=deleted; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`
  const res = NextResponse.json({ ok: true })
  res.headers.append('Set-Cookie', expired)
  return res
}
