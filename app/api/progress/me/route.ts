// app/api/progress/me/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromRequest, verifyJwt } from "@/lib/auth";

/**
 * GET /api/progress/me?courseId=...
 * Returns the current user's progress for the given courseId.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const courseId = url.searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "courseId required" }, { status: 400 });
    }

    // FIX 1 — await the token
    const token = await getTokenFromRequest(request);

    // FIX 2 — remove generic type
    const payload = token ? verifyJwt(token) : null;

    if (!payload) {
      return NextResponse.json({ progress: null });
    }

    const progress = await prisma.progress.findFirst({
      where: {
        courseId,
        userId: payload.sub,
      },
    });

    return NextResponse.json({ progress });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Error" },
      { status: 500 }
    );
  }
}
