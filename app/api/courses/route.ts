

// app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getTokenFromRequest, verifyJwt } from '@/lib/auth'

const CreateCourseSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  slug: z.string().min(3)
})

export async function GET() {
  const courses = await prisma.course.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: {
      modules: { where: { deletedAt: null }, orderBy: { order: 'asc' } },
      owner: { select: { id: true, email: true, name: true } }
    }
  })
  return NextResponse.json({ courses })
}

export async function POST(request: NextRequest) {
  try {
    const token = await getTokenFromRequest(request)
    const payload = token ? verifyJwt(token) : null
    if (!payload || !['INSTRUCTOR', 'ADMIN'].includes(payload.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = CreateCourseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 })
    }

    const exists = await prisma.course.findUnique({ where: { slug: parsed.data.slug } })
    if (exists) return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })

    const created = await prisma.course.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description ?? '',
        slug: parsed.data.slug,
        ownerId: payload.sub
      }
    })

    return NextResponse.json({ course: created }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Bad Request' }, { status: 400 })
  }
}
