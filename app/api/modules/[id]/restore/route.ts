// // app/api/modules/[id]/restore/route.ts


import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromRequest, verifyJwt } from "@/lib/auth";
import { checkOwnershipOrAdmin } from "@/lib/rbac";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const token = await getTokenFromRequest(request);
  const payload = token ? verifyJwt(token) : null;
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const module = await prisma.module.findUnique({ where: { id } });
  if (!module) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  if (!module.deletedAt) {
    return NextResponse.json(
      { error: "Module is not deleted" },
      { status: 400 }
    );
  }

  const course = await prisma.course.findUnique({
    where: { id: module.courseId },
  });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (!checkOwnershipOrAdmin(payload, course.ownerId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.module.update({
    where: { id },
    data: { deletedAt: null },
  });

  return NextResponse.json({ ok: true });
}


