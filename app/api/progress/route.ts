// app/api/progress/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getTokenFromRequest, verifyJwt } from '@/lib/auth'

const CreateProgressSchema = z.object({
  courseId: z.string().min(1),
  percent: z.number().min(0).max(100).optional()
})

/**
 * Creates or upserts a Progress row for the authenticated user.
 * If a progress exists for (user, course) it returns the existing row.
 * If not, it creates with the provided percent (default 0).
 */
export async function POST(request: Request) {
  try {
    const token = await getTokenFromRequest(request)
    const payload = token ? verifyJwt(token) : null
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = CreateProgressSchema.parse(body)

    const existing = await prisma.progress.findFirst({
      where: { userId: payload.sub, courseId: parsed.courseId }
    })
    if (existing) {
      return NextResponse.json({ progress: existing })
    }

    const created = await prisma.progress.create({
      data: {
        userId: payload.sub,
        courseId: parsed.courseId,
        percent: parsed.percent ?? 0
      }
    })
    return NextResponse.json({ progress: created }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Bad Request' }, { status: 400 })
  }
}
