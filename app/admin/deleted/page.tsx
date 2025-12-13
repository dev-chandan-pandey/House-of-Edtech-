// // app/admin/deleted/page.tsx

import { prisma } from '@/lib/prisma'
import RestoreButton from '@/components/RestoreButton'
import Link from 'next/link'

export const revalidate = 30

export default async function DeletedAdminPage() {
  const [deletedCourses, deletedModules] = await Promise.all([
    prisma.course.findMany({
      where: { deletedAt: { not: null } },
      include: { owner: { select: { name: true, email: true } } },
    }),
    prisma.module.findMany({
      where: { deletedAt: { not: null } },
      include: { course: { select: { title: true, slug: true } } },
    }),
  ])

  return (
    <div className="container mx-auto py-8 px-4">
    
  <div className="flex items-center justify-between">
   <h1 className="text-2xl font-bold">Deleted Items</h1>
      {/* rest unchanged */}
      <Link href="/admin/dashboard" className="btn flex items-center gap-2">
  ← Admin Dashboard
</Link>
      </div>
      <section className="mt-6">
        <h2 className="font-semibold">Deleted Courses</h2>

        {deletedCourses.map((c) => (
          <div key={c.id} className="p-3 bg-white rounded shadow flex justify-between">
            <div>
              <div className="font-medium">{c.title}</div>
              <div className="text-xs text-slate-600">
                {c.owner?.name ?? c.owner?.email}
              </div>
            </div>

            <RestoreButton type="course" id={c.id} />
          </div>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="font-semibold">Deleted Modules</h2>

        {deletedModules.map((m) => (
          <div key={m.id} className="p-3 bg-white rounded shadow flex justify-between">
            <div>
              <div className="font-medium">{m.title}</div>
              <div className="text-xs text-slate-600">
                Course: {m.course?.title}
              </div>
            </div>

            <RestoreButton type="module" id={m.id} />
          </div>
        ))}
      </section>
    </div>
  )
}
