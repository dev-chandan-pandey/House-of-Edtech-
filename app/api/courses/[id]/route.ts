// // app/api/courses/[id]/route.ts
// import { NextResponse } from 'next/server'
// import { prisma } from '@/src/lib/prisma'
// import { z } from 'zod'
// import { getTokenFromRequest, verifyJwt } from '@/src/lib/auth'

// const UpdateCourse = z.object({
//   title: z.string().min(3).optional(),
//   description: z.string().optional(),
//   slug: z.string().min(3).optional()
// })

// export async function GET(request: Request, { params }: { params: { id: string } }) {
//   const course = await prisma.course.findUnique({
//     where: { id: params.id },
//     include: { modules: { orderBy: { order: 'asc' } } }
//   })
//   if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })
//   return NextResponse.json({ course })
// }

// export async function PUT(request: Request, { params }: { params: { id: string } }) {
//   try {
//     const token = getTokenFromRequest(request)
//     const payload = token ? verifyJwt<{ sub: string; role: string }>(token) : null
//     if (!payload || !['INSTRUCTOR', 'ADMIN'].includes(payload.role)) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }
//     const body = await request.json()
//     const parsed = UpdateCourse.parse(body)
//     const updated = await prisma.course.update({
//       where: { id: params.id },
//       data: { ...parsed }
//     })
//     return NextResponse.json({ course: updated })
//   } catch (err: any) {
//     return NextResponse.json({ error: err?.message ?? 'Bad Request' }, { status: 400 })
//   }
// }

// export async function DELETE(request: Request, { params }: { params: { id: string } }) {
//   const token = getTokenFromRequest(request)
//   const payload = token ? verifyJwt<{ sub: string; role: string }>(token) : null
//   if (!payload || payload.role !== 'ADMIN') {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//   }
//   await prisma.course.delete({ where: { id: params.id } })
//   return NextResponse.json({ ok: true })
// }
// app/api/courses/[id]/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
// import { z } from 'zod'
// import { getTokenFromRequest, verifyJwt, JwtPayload } from '@/lib/auth'

// const UpdateCourse = z.object({
//   title: z.string().min(3).optional(),
//   description: z.string().optional(),
//   slug: z.string().min(3).optional()
// })

// // ✔ FIXED SIGNATURE — params is Promise<{ id: string }>
// export async function GET(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params

//   const course = await prisma.course.findUnique({
//     where: { id },
//     include: { modules: { orderBy: { order: 'asc' } } }
//   })

//   if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })

//   return NextResponse.json({ course })
// }

// export async function PUT(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params

//   try {
//    const token = await getTokenFromRequest(req)
//     const payload = token ? verifyJwt(token) : null

//     if (!payload || !['INSTRUCTOR', 'ADMIN'].includes(payload.role ?? '')) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const body = await req.json()
//     const parsed = UpdateCourse.parse(body)

//     const updated = await prisma.course.update({
//       where: { id },
//       data: parsed
//     })

//     return NextResponse.json({ course: updated })
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message ?? 'Bad Request' }, { status: 400 })
//   }
// }

// export async function DELETE(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params

//  const token = await getTokenFromRequest(req)
//   const payload = token ? verifyJwt(token) : null

//   if (!payload || payload.role !== 'ADMIN') {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//   }

//   await prisma.course.delete({ where: { id } })

//   return NextResponse.json({ ok: true })
// }


// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
// import { z } from 'zod'
// import { getTokenFromRequest, verifyJwt } from '@/lib/auth'
// import { checkOwnershipOrAdmin } from '@/lib/rbac'

// const UpdateCourse = z.object({
//   title: z.string().min(3).optional(),
//   description: z.string().optional(),
//   slug: z.string().min(3).optional()
// })

// /* ------------------------------------------------------------
//    GET /api/courses/[id]
// ------------------------------------------------------------ */
// export async function GET(
//   req: Request,
//   context: { params: { id: string } }
// ) {
//   const { id } = context.params

//   try {
//     const course = await prisma.course.findUnique({
//       where: { id },
//       include: {
//         modules: { where: { deletedAt: null }, orderBy: { order: 'asc' } },
//         owner: { select: { id: true, email: true, name: true } }
//       }
//     })

//     if (!course || course.deletedAt) {
//       return NextResponse.json({ error: 'Not found' }, { status: 404 })
//     }

//     return NextResponse.json({ course })
//   } catch (err: any) {
//     return NextResponse.json(
//       { error: err?.message ?? 'Server error' },
//       { status: 500 }
//     )
//   }
// }

// /* ------------------------------------------------------------
//    PUT /api/courses/[id] (Update Course)
// ------------------------------------------------------------ */
// export async function PUT(
//   req: Request,
//   context: { params: { id: string } }
// ) {
//   const { id } = context.params

//   try {
//     const token = await getTokenFromRequest(req)
//     const payload = token ? verifyJwt(token) : null

//     // ✔ Keep your original role check
//     if (!payload || !['INSTRUCTOR', 'ADMIN'].includes(payload.role ?? '')) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const course = await prisma.course.findUnique({ where: { id } })
//     if (!course || course.deletedAt) {
//       return NextResponse.json({ error: 'Not found' }, { status: 404 })
//     }

//     // ✔ Ownership rule: instructor must be owner; admin allowed always
//     if (!checkOwnershipOrAdmin(payload, course.ownerId)) {
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
//     }

//     const body = await req.json()
//     const parsed = UpdateCourse.parse(body)

//     const updated = await prisma.course.update({
//       where: { id },
//       data: parsed
//     })

//     return NextResponse.json({ course: updated })
//   } catch (err: any) {
//     return NextResponse.json(
//       { error: err?.message ?? 'Bad Request' },
//       { status: 400 }
//     )
//   }
// }

// /* ------------------------------------------------------------
//    DELETE /api/courses/[id] (Soft Delete)
// ------------------------------------------------------------ */
// export async function DELETE(
//   req: Request,
//   context: { params: { id: string } }
// ) {
//   const { id } = context.params

//   try {
//     const token = await getTokenFromRequest(req)
//     const payload = token ? verifyJwt(token) : null

//     // ✔ Keep your original DELETE rule: only ADMIN can delete
//     if (!payload || payload.role !== 'ADMIN') {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     // Check record exists & not deleted
//     const course = await prisma.course.findUnique({ where: { id } })
//     if (!course || course.deletedAt) {
//       return NextResponse.json({ error: 'Not found' }, { status: 404 })
//     }

//     // Soft-delete course + modules
//     const now = new Date()

//     await prisma.course.update({
//       where: { id },
//       data: { deletedAt: now }
//     })

//     await prisma.module.updateMany({
//       where: { courseId: id },
//       data: { deletedAt: now }
//     })

//     return NextResponse.json({ ok: true })
//   } catch (err: any) {
//     return NextResponse.json(
//       { error: err?.message ?? 'Bad Request' },
//       { status: 400 }
//     )
//   }
// }


// // app/api/courses/[id]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { requireAuth, requireRole } from "@/lib/rbac";
// import { z } from "zod";

// // ---------------- GET COURSE ----------------
// export async function GET(
//   request: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params;

//   const course = await prisma.course.findUnique({
//     where: { id },
//     include: {
//       owner: true,
//       modules: {
//         where: { deletedAt: null },
//         orderBy: { order: "asc" },
//       },
//     },
//   });

//   if (!course)
//     return NextResponse.json({ error: "Course not found" }, { status: 404 });

//   return NextResponse.json({ course });
// }

// // ---------------- UPDATE COURSE ----------------
// const UpdateCourseSchema = z.object({
//   title: z.string().min(1),
//   description: z.string().optional(),
// });

// export async function PUT(
//   request: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params;

//   // Must be owner or admin
//   const user = await requireAuth(request);

//   const course = await prisma.course.findUnique({ where: { id } });
//   if (!course)
//     return NextResponse.json({ error: "Not found" }, { status: 404 });

//   if (user.role !== "ADMIN" && user.sub !== course.ownerId)
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });

//   const body = await request.json();
//   const parsed = UpdateCourseSchema.safeParse(body);
//   if (!parsed.success)
//     return NextResponse.json({ error: "Invalid input" }, { status: 400 });

//   const updated = await prisma.course.update({
//     where: { id },
//     data: parsed.data,
//   });

//   return NextResponse.json({ course: updated });
// }

// // ---------------- DELETE COURSE ----------------
// export async function DELETE(
//   request: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params;

//   // admin or owner
//   const user = await requireAuth(request);

//   const course = await prisma.course.findUnique({ where: { id } });
//   if (!course)
//     return NextResponse.json({ error: "Not found" }, { status: 404 });

//   if (user.role !== "ADMIN" && user.sub !== course.ownerId)
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });

//   await prisma.course.update({
//     where: { id },
//     data: { deletedAt: new Date() },
//   });

//   await prisma.module.updateMany({
//     where: { courseId: id },
//     data: { deletedAt: new Date() },
//   });

//   return NextResponse.json({ ok: true });
// }
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { requireAuth } from "@/lib/rbac";
// import { z } from "zod";

// // ---------------- GET COURSE ----------------
// export async function GET(
//   request: NextRequest,
//   context: { params: { id: string } }
// ) {
//   const { id } = context.params; // ✅ FIXED

//   const course = await prisma.course.findUnique({
//     where: { id },
//     include: {
//       owner: true,
//       modules: {
//         where: { deletedAt: null },
//         orderBy: { order: "asc" },
//       },
//     },
//   });

//   if (!course)
//     return NextResponse.json({ error: "Course not found" }, { status: 404 });

//   return NextResponse.json({ course });
// }

// // ---------------- UPDATE COURSE ----------------
// const UpdateCourseSchema = z.object({
//   title: z.string().min(1),
//   description: z.string().optional(),
// });

// export async function PUT(
//   request: NextRequest,
//   context: { params: { id: string } }
// ) {
//   const { id } = context.params; // ✅ FIXED

//   const user = await requireAuth(request);

//   const course = await prisma.course.findUnique({ where: { id } });
//   if (!course)
//     return NextResponse.json({ error: "Not found" }, { status: 404 });

//   if (user.role !== "ADMIN" && user.sub !== course.ownerId)
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });

//   const body = await request.json();
//   const parsed = UpdateCourseSchema.safeParse(body);

//   if (!parsed.success)
//     return NextResponse.json({ error: "Invalid input" }, { status: 400 });

//   const updated = await prisma.course.update({
//     where: { id },
//     data: parsed.data,
//   });

//   return NextResponse.json({ course: updated });
// }

// // ---------------- DELETE COURSE ----------------
// export async function DELETE(
//   request: NextRequest,
//   context: { params: { id: string } }
// ) {
//   const { id } = context.params; // ✅ FIXED

//   const user = await requireAuth(request);

//   const course = await prisma.course.findUnique({ where: { id } });
//   if (!course)
//     return NextResponse.json({ error: "Not found" }, { status: 404 });

//   if (user.role !== "ADMIN" && user.sub !== course.ownerId)
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });

//   await prisma.course.update({
//     where: { id },
//     data: { deletedAt: new Date() },
//   });

//   await prisma.module.updateMany({
//     where: { courseId: id },
//     data: { deletedAt: new Date() },
//   });

//   return NextResponse.json({ ok: true });
// }

// app/api/courses/[id]/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
// import { z } from 'zod'
// import { requireAuth } from '@/lib/rbac'

// const UpdateCourseSchema = z.object({
//   title: z.string().min(1),
//   description: z.string().optional(),
//   slug: z.string().min(3).optional()
// })

// /**
//  * Note: context.params is a plain object { id: string } in these handlers.
//  * Do NOT use Promise<...> here.
//  */
// export async function GET(request: NextRequest, context: { params: { id: string } }) {
//   const { id } = context.params

//   const course = await prisma.course.findUnique({
//     where: { id },
//     include: {
//       owner: true,
//       modules: {
//         where: { deletedAt: null },
//         orderBy: { order: 'asc' }
//       }
//     }
//   })

//   if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
//   return NextResponse.json({ course })
// }

// export async function PUT(request: NextRequest, context: { params: { id: string } }) {
//   const { id } = context.params
//   try {
//     const user = await requireAuth(request) // throws or returns user { sub, role } depending on your implementation

//     const course = await prisma.course.findUnique({ where: { id } })
//     if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })

//     if (user.role !== 'ADMIN' && user.sub !== course.ownerId) {
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
//     }

//     const body = await request.json()
//     const parsed = UpdateCourseSchema.safeParse(body)
//     if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

//     const updated = await prisma.course.update({
//       where: { id },
//       data: parsed.data
//     })

//     return NextResponse.json({ course: updated })
//   } catch (err: any) {
//     return NextResponse.json({ error: err?.message ?? 'Bad Request' }, { status: 400 })
//   }
// }

// export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
//   const { id } = context.params
//   try {
//     const user = await requireAuth(request)

//     const course = await prisma.course.findUnique({ where: { id } })
//     if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })

//     if (user.role !== 'ADMIN' && user.sub !== course.ownerId) {
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
//     }

//     // Soft-delete course and its modules
//     await prisma.course.update({ where: { id }, data: { deletedAt: new Date() } })
//     await prisma.module.updateMany({ where: { courseId: id }, data: { deletedAt: new Date() } })

//     return NextResponse.json({ ok: true })
//   } catch (err: any) {
//     return NextResponse.json({ error: err?.message ?? 'Bad Request' }, { status: 400 })
//   }
// }

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { requireAuth } from '@/lib/rbac'

const UpdateCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  slug: z.string().min(3).optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params // ✅ REQUIRED

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      owner: true,
      modules: {
        where: { deletedAt: null },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  return NextResponse.json({ course })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params // ✅ REQUIRED
  const user = await requireAuth(req)

  const body = await req.json()
  const parsed = UpdateCourseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const course = await prisma.course.findUnique({ where: { id } })
  if (!course) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (user.role !== 'ADMIN' && user.sub !== course.ownerId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updated = await prisma.course.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json({ course: updated })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params // ✅ REQUIRED
  const user = await requireAuth(req)

  const course = await prisma.course.findUnique({ where: { id } })
  if (!course) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (user.role !== 'ADMIN' && user.sub !== course.ownerId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.course.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  await prisma.module.updateMany({
    where: { courseId: id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
