
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, RegisterSchema, signJwt, buildSetCookie } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = RegisterSchema.parse(body)

    const existing = await prisma.user.findUnique({
      where: { email: parsed.email }
    })

    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    const hashed = await hashPassword(parsed.password)

    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        name: parsed.name,
        password: hashed
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    const token = signJwt({
      sub: user.id,
      email: user.email,
      role: user.role
    })

    const res = NextResponse.json({ user })
    res.headers.append('Set-Cookie', buildSetCookie(token))

    return res
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Invalid request' }, { status: 400 })
  }
}
