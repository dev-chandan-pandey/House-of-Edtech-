// // app/api/modules/[id]/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
// import { z } from 'zod'
// import { requireRole } from '@/lib/rbac'

// const UpdateModule = z.object({
//   title: z.string().min(1).optional(),
//   content: z.string().optional(),
//   order: z.number().int().positive().optional()
// })

// export function GET(req: NextRequest, context: { params: { id: string } })
//  {
//   const module = await prisma.module.findUnique({ where: { id: params.id } })
//   if (!module) return NextResponse.json({ error: 'Not found' }, { status: 404 })
//   return NextResponse.json({ module })
// }

// export async function PUT(request: Request, { params }: { params: { id: string } }) {
//   try {
//     try {
//       requireRole(request, ['INSTRUCTOR', 'ADMIN'])
//     } catch (e: any) {
//       return NextResponse.json({ error: e.message }, { status: e.status || 401 })
//     }

//     const body = await request.json()
//     const parsed = UpdateModule.parse(body)

//     const updated = await prisma.module.update({
//       where: { id: params.id },
//       data: { ...parsed }
//     })
//     return NextResponse.json({ module: updated })
//   } catch (err: any) {
//     return NextResponse.json({ error: err?.message ?? 'Bad request' }, { status: 400 })
//   }
// }

// export async function DELETE(request: Request, { params }: { params: { id: string } }) {
//   try {
//     try {
//       requireRole(request, ['ADMIN']) // only ADMIN can delete modules (policy)
//     } catch (e: any) {
//       return NextResponse.json({ error: e.message }, { status: e.status || 401 })
//     }
//     await prisma.module.delete({ where: { id: params.id } })
//     return NextResponse.json({ ok: true })
//   } catch (err: any) {
//     return NextResponse.json({ error: err?.message ?? 'Bad request' }, { status: 400 })
//   }
// }
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { z } from "zod";
// import { requireRole } from "@/lib/rbac";

// const UpdateModule = z.object({
//   title: z.string().min(1).optional(),
//   content: z.string().optional(),
//   order: z.number().int().positive().optional(),
// });

// /** GET /api/modules/[id] */
// export async function GET(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params;

//   const module = await prisma.module.findUnique({ where: { id } });

//   if (!module) {
//     return NextResponse.json({ error: "Module not found" }, { status: 404 });
//   }

//   return NextResponse.json({ module });
// }

// /** PUT /api/modules/[id] */
// export async function PUT(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params;

//   try {
//     requireRole(req, ["INSTRUCTOR", "ADMIN"]);
//   } catch (err: any) {
//     return NextResponse.json(
//       { error: err.message },
//       { status: err.status || 403 }
//     );
//   }

//   const body = await req.json();
//   const parsed = UpdateModule.parse(body);

//   const updated = await prisma.module.update({
//     where: { id },
//     data: parsed,
//   });

//   return NextResponse.json({ module: updated });
// }

// /** DELETE /api/modules/[id] */
// export async function DELETE(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params;

//   try {
//     requireRole(req, ["ADMIN"]);
//   } catch (err: any) {
//     return NextResponse.json(
//       { error: err.message },
//       { status: err.status || 403 }
//     );
//   }

//   await prisma.module.delete({ where: { id } });

//   return NextResponse.json({ ok: true });
// }
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { z } from "zod";
// import { getTokenFromRequest, verifyJwt } from "@/lib/auth";
// import { checkOwnershipOrAdmin, requireRole } from "@/lib/rbac";

// const UpdateModule = z.object({
//   title: z.string().min(1).optional(),
//   content: z.string().optional(),
//   order: z.number().int().positive().optional(),
// });

// /* -----------------------------------------------------------
//    GET /api/modules/[id]
// ----------------------------------------------------------- */
// export async function GET(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params;

//   const module = await prisma.module.findUnique({ where: { id } });
//   if (!module || module.deletedAt)
//     return NextResponse.json({ error: "Not found" }, { status: 404 });

//   return NextResponse.json({ module });
// }

// /* -----------------------------------------------------------
//    PUT /api/modules/[id]  → Update module
//    Combined logic:
//    - requireRole(INSTRUCTOR, ADMIN)
//    - also require ownership if instructor
// ----------------------------------------------------------- */
// export async function PUT(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params;

//   try {
//     // 1️⃣ Role check (old behavior)
//     try {
//       await requireRole(req, ["INSTRUCTOR", "ADMIN"]);
//     } catch (err: any) {
//       return NextResponse.json(
//         { error: err.message },
//         { status: err.status || 401 }
//       );
//     }

//     // 2️⃣ Get auth payload for ownership check
//     const token = await getTokenFromRequest(req);
//     const payload = token ? verifyJwt(token) : null;

//     // 3️⃣ Ensure module exists
//     const module = await prisma.module.findUnique({ where: { id } });
//     if (!module || module.deletedAt)
//       return NextResponse.json({ error: "Not found" }, { status: 404 });

//     // 4️⃣ Fetch course to check ownership
//     const course = await prisma.course.findUnique({
//       where: { id: module.courseId },
//     });
//     if (!course)
//       return NextResponse.json(
//         { error: "Course not found" },
//         { status: 404 }
//       );

//     // 5️⃣ Ownership check (owner instructor or admin)
//     if (!checkOwnershipOrAdmin(payload, course.ownerId)) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     // 6️⃣ Parse & update
//     const body = await req.json();
//     const parsed = UpdateModule.parse(body);

//     const updated = await prisma.module.update({
//       where: { id },
//       data: { ...parsed },
//     });

//     return NextResponse.json({ module: updated });
//   } catch (err: any) {
//     return NextResponse.json(
//       { error: err?.message ?? "Bad request" },
//       { status: 400 }
//     );
//   }
// }

// /* -----------------------------------------------------------
//    DELETE /api/modules/[id]  
//    Combined logic:
//    - old: requireRole(["ADMIN"])
//    - new: soft-delete module
//    - respects course ownership (admin override)
// ----------------------------------------------------------- */
// export async function DELETE(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params;

//   try {
//     // 1️⃣ Admin-only check from old code
//     try {
//       await requireRole(req, ["ADMIN"]);
//     } catch (err: any) {
//       return NextResponse.json(
//         { error: err.message },
//         { status: err.status || 401 }
//       );
//     }

//     // 2️⃣ Get auth payload
//     const token = await getTokenFromRequest(req);
//     const payload = token ? verifyJwt(token) : null;

//     // 3️⃣ Module exists check
//     const module = await prisma.module.findUnique({ where: { id } });
//     if (!module || module.deletedAt)
//       return NextResponse.json({ error: "Not found" }, { status: 404 });

//     // 4️⃣ Get course (ownership check)
//     const course = await prisma.course.findUnique({
//       where: { id: module.courseId },
//     });
//     if (!course)
//       return NextResponse.json(
//         { error: "Course not found" },
//         { status: 404 }
//       );

//     // 5️⃣ Ownership or admin
//     if (!checkOwnershipOrAdmin(payload, course.ownerId)) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     // 6️⃣ Soft delete the module
//     await prisma.module.update({
//       where: { id },
//       data: { deletedAt: new Date() },
//     });

//     return NextResponse.json({ ok: true });
//   } catch (err: any) {
//     return NextResponse.json(
//       { error: err?.message ?? "Bad request" },
//       { status: 400 }
//     );
//   }
// }
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { z } from "zod";
// import { getTokenFromRequest, verifyJwt } from "@/lib/auth";
// import { checkOwnershipOrAdmin, requireRole } from "@/lib/rbac";

// // Validation
// const UpdateModule = z.object({
//   title: z.string().min(1).optional(),
//   content: z.string().optional(),
//   order: z.number().int().positive().optional(),
// });

// /* -----------------------------------------------------------
//    GET /api/modules/[id]
// ----------------------------------------------------------- */
// export async function GET(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const module = await prisma.module.findUnique({
//     where: { id: params.id },
//   });

//   if (!module || module.deletedAt)
//     return NextResponse.json({ error: "Not found" }, { status: 404 });

//   return NextResponse.json({ module });
// }

// /* -----------------------------------------------------------
//    PUT /api/modules/[id]
// ----------------------------------------------------------- */
// export async function PUT(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     // require instructor or admin
//     await requireRole(req, ["INSTRUCTOR", "ADMIN"]);

//     const token = await getTokenFromRequest(req);
//     const payload = token ? verifyJwt(token) : null;

//     const module = await prisma.module.findUnique({
//       where: { id: params.id },
//     });

//     if (!module || module.deletedAt)
//       return NextResponse.json({ error: "Not found" }, { status: 404 });

//     const course = await prisma.course.findUnique({
//       where: { id: module.courseId },
//     });

//     if (!course)
//       return NextResponse.json({ error: "Course not found" }, { status: 404 });

//     // ownership check
//     if (!checkOwnershipOrAdmin(payload, course.ownerId))
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });

//     // update module
//     const body = await req.json();
//     const parsed = UpdateModule.parse(body);

//     const updated = await prisma.module.update({
//       where: { id: params.id },
//       data: parsed,
//     });

//     return NextResponse.json({ module: updated });
//   } catch (err: any) {
//     return NextResponse.json(
//       { error: err?.message ?? "Bad request" },
//       { status: err.status || 400 }
//     );
//   }
// }

// /* -----------------------------------------------------------
//    DELETE /api/modules/[id]
// ----------------------------------------------------------- */
// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     await requireRole(req, ["ADMIN"]); // admin-only

//     const token = await getTokenFromRequest(req);
//     const payload = token ? verifyJwt(token) : null;

//     const module = await prisma.module.findUnique({
//       where: { id: params.id },
//     });

//     if (!module || module.deletedAt)
//       return NextResponse.json({ error: "Not found" }, { status: 404 });

//     const course = await prisma.course.findUnique({
//       where: { id: module.courseId },
//     });

//     if (!course)
//       return NextResponse.json({ error: "Course not found" }, { status: 404 });

//     if (!checkOwnershipOrAdmin(payload, course.ownerId))
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });

//     await prisma.module.update({
//       where: { id: params.id },
//       data: { deletedAt: new Date() },
//     });

//     return NextResponse.json({ ok: true });
//   } catch (err: any) {
//     return NextResponse.json(
//       { error: err?.message ?? "Bad request" },
//       { status: err.status || 400 }
//     );
//   }
// }


// app/api/modules/[id]/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
// import { z } from 'zod'
// import { getTokenFromRequest, verifyJwt } from '@/lib/auth'
// import { requireRole, checkOwnershipOrAdmin } from '@/lib/rbac'

// const UpdateModuleSchema = z.object({
//   title: z.string().min(1).optional(),
//   content: z.string().optional(),
//   order: z.number().int().positive().optional()
// })

// export async function GET(request: NextRequest, context: { params: { id: string } }) {
//   const { id } = context.params
//   const module = await prisma.module.findUnique({ where: { id } })
//   if (!module || module.deletedAt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
//   return NextResponse.json({ module })
// }

// export async function PUT(request: NextRequest, context: { params: { id: string } }) {
//   const { id } = context.params
//   try {
//     // role check (INSTRUCTOR or ADMIN)
//     try {
//       await requireRole(request, ['INSTRUCTOR', 'ADMIN'])
//     } catch (e: any) {
//       return NextResponse.json({ error: e.message }, { status: e.status || 401 })
//     }

//     const token = await getTokenFromRequest(request)
//     const payload = token ? verifyJwt(token) : null

//     const module = await prisma.module.findUnique({ where: { id } })
//     if (!module || module.deletedAt) return NextResponse.json({ error: 'Not found' }, { status: 404 })

//     const course = await prisma.course.findUnique({ where: { id: module.courseId } })
//     if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

//     if (!checkOwnershipOrAdmin(payload, course.ownerId)) {
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
//     }

//     const body = await request.json()
//     const parsed = UpdateModuleSchema.safeParse(body)
//     if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

//     const updated = await prisma.module.update({ where: { id }, data: parsed.data })
//     return NextResponse.json({ module: updated })
//   } catch (err: any) {
//     return NextResponse.json({ error: err?.message ?? 'Bad Request' }, { status: 400 })
//   }
// }

// export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
//   const { id } = context.params
//   try {
//     // require ADMIN (or you can change to owner-or-admin if desired)
//     try {
//       await requireRole(request, ['ADMIN'])
//     } catch (e: any) {
//       return NextResponse.json({ error: e.message }, { status: e.status || 401 })
//     }

//     const token = await getTokenFromRequest(request)
//     const payload = token ? verifyJwt(token) : null

//     const module = await prisma.module.findUnique({ where: { id } })
//     if (!module || module.deletedAt) return NextResponse.json({ error: 'Not found' }, { status: 404 })

//     const course = await prisma.course.findUnique({ where: { id: module.courseId } })
//     if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

//     if (!checkOwnershipOrAdmin(payload, course.ownerId)) {
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
//     }

//     await prisma.module.update({ where: { id }, data: { deletedAt: new Date() } })
//     return NextResponse.json({ ok: true })
//   } catch (err: any) {
//     return NextResponse.json({ error: err?.message ?? 'Bad Request' }, { status: 400 })
//   }
// }

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/rbac'
import { z } from 'zod'

const UpdateModuleSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  order: z.number().int().positive().optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params // ✅ REQUIRED

  const module = await prisma.module.findUnique({ where: { id } })
  if (!module || module.deletedAt) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ module })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await requireAuth(req)

  const module = await prisma.module.findUnique({ where: { id } })
  if (!module || module.deletedAt) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const course = await prisma.course.findUnique({
    where: { id: module.courseId },
  })

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  if (user.role !== 'ADMIN' && user.sub !== course.ownerId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = UpdateModuleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const updated = await prisma.module.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json({ module: updated })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await requireAuth(req)

  const module = await prisma.module.findUnique({ where: { id } })
  if (!module || module.deletedAt) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const course = await prisma.course.findUnique({
    where: { id: module.courseId },
  })

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  if (user.role !== 'ADMIN' && user.sub !== course.ownerId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.module.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
