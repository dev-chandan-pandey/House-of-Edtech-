
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireRole } from "@/lib/rbac";

const RoleSchema = z.object({
  role: z.enum(["ADMIN", "INSTRUCTOR", "STUDENT"]),
});

// export async function PUT(
//   request: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   try {
//     // Await dynamic params (Next.js 16 requirement)
//     const { id } = await context.params;

//     // Only admin allowed
//     try {
//        await  requireRole(request, ["ADMIN"]);
//     } catch (e: any) {
//       return NextResponse.json({ error: e.message }, { status: e.status || 403 });
//     }

//     const body = await request.json();
//     const parsed = RoleSchema.parse(body);

//     const user = await prisma.user.update({
//       where: { id },
//       data: { role: parsed.role },
//     });

//     return NextResponse.json({ user });
//   } catch (err: any) {
//     return NextResponse.json(
//       { error: err?.message ?? "Bad request" },
//       { status: 400 }
//     );
//   }
// }
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // ✅ MUST await
    await requireRole(request, ['ADMIN'])

    const body = await request.json()
    const parsed = RoleSchema.parse(body)

    const user = await prisma.user.update({
      where: { id },
      data: { role: parsed.role },
      select: { id: true, email: true, role: true },
    })

    return NextResponse.json({ user })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? 'Forbidden' },
      { status: err.status ?? 400 }
    )
  }
}
