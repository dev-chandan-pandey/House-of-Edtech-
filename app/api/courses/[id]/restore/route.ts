

// app/api/courses/[id]/restore/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Must await params in Next.js 15/16
    const { id } = await context.params;

    // Only ADMIN can restore
    try {
      requireRole(request, ["ADMIN"]);
    } catch (e: any) {
      return NextResponse.json(
        { error: e.message },
        { status: e.status || 401 }
      );
    }

    const course = await prisma.course.findUnique({ where: { id } });

    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 });

    if (!course.deletedAt)
      return NextResponse.json(
        { error: "Course is not deleted" },
        { status: 400 }
      );

    // Restore course
    await prisma.course.update({
      where: { id },
      data: { deletedAt: null },
    });

    // Restore modules of the course
    await prisma.module.updateMany({
      where: { courseId: id },
      data: { deletedAt: null },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Could not restore" },
      { status: 500 }
    );
  }
}

