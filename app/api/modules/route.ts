
// app/api/modules/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getTokenFromRequest, verifyJwt } from '@/lib/auth'
import { checkOwnershipOrAdmin } from '@/lib/rbac'

const CreateModuleSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  courseId: z.string().min(1),
  order: z.number().int().positive()
})

export async function GET() {
  const modules = await prisma.module.findMany({
    where: { deletedAt: null },
    orderBy: { order: 'asc' }
  })
  return NextResponse.json({ modules })
}

export async function POST(request: NextRequest) {
  try {
    const token = await getTokenFromRequest(request)
    const payload = token ? verifyJwt(token) : null
    if (!payload || !['INSTRUCTOR', 'ADMIN'].includes(payload.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = CreateModuleSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const course = await prisma.course.findUnique({ where: { id: parsed.data.courseId } })
    if (!course || course.deletedAt) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

    // If INSTRUCTOR, must be owner; ADMIN allowed
    if (!checkOwnershipOrAdmin(payload, course.ownerId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const created = await prisma.module.create({
      data: {
        title: parsed.data.title,
        content: parsed.data.content ?? '',
        courseId: parsed.data.courseId,
        order: parsed.data.order
      }
    })

    return NextResponse.json({ module: created }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Bad Request' }, { status: 400 })
  }
}
