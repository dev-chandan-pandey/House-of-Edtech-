export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LoginSchema, verifyPassword, signJwt, buildSetCookie } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = LoginSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: parsed.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const ok = await verifyPassword(parsed.password, user.password)
    if (!ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = signJwt({
      sub: user.id,
      email: user.email,
      role: user.role
    })

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    })

    res.headers.append('Set-Cookie', buildSetCookie(token))
    return res
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Invalid request' }, { status: 400 })
  }
}
