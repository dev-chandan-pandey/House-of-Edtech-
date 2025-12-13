
// app/api/progress/[id]/route.ts
import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { getTokenFromRequest, verifyJwt } from "@/lib/auth"

// -----------------------------
// GET /api/progress/[id]
// -----------------------------
export async function GET(
  request: NextRequest,
  context: { params:Promise<{ id: string }>}
) {
  const { id } =  await context.params

  const progress = await prisma.progress.findUnique({ where: { id } })
  if (!progress)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({ progress })
}

// -----------------------------
// PUT /api/progress/[id]
// -----------------------------
const UpdateProgress = z.object({
  percent: z.number().min(0).max(100),
})

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }>}
) {
  const { id } = await context.params

  // get token
  const token = await getTokenFromRequest(request)
  const payload = token ? verifyJwt(token) : null
  if (!payload)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // verify progress exists
  const progress = await prisma.progress.findUnique({ where: { id } })
  if (!progress)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  // only owner can update
  if (progress.userId !== payload.sub)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // validate body
  const body = await request.json()
  const parsed = UpdateProgress.parse(body)

  // update
  const updated = await prisma.progress.update({
    where: { id },
    data: { percent: parsed.percent },
  })

  return NextResponse.json({ progress: updated })
}
