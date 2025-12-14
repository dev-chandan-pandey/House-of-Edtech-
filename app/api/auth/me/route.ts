
// app/api/auth/me/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyJwt, JwtPayload } from '@/lib/auth'

export async function GET(req: Request) {
  try {
   const token = await getTokenFromRequest(req)

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const payload = verifyJwt(token)
    if (!payload?.sub) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true }
    })

    return NextResponse.json({ user: user ?? null })
  } catch {
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
