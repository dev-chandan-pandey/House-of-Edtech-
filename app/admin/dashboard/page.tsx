
// app/admin/dashboard/page.tsx
import { prisma } from '@/lib/prisma'
import PromoteUserButton from '@/components/PromoteUserButton'
import Link from 'next/link'
import ShowIfCanManage from '@/components/ShowIfCanManage'
import DeleteCourseButton from '@/components/DeleteCourseButton'
import DeleteModuleButton from '@/components/DeleteModuleButton'

export const revalidate = 30

export default async function AdminDashboard() {
  const [courses, users] = await Promise.all([
    prisma.course.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { modules: { where: { deletedAt: null }, orderBy: { order: 'asc' } } }
    }),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, email: true, name: true, role: true } })
  ])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      {/* rest unchanged */}
      <Link href="/dashboard" className="btn flex items-center gap-2">
  ← Dashboard
</Link>
      </div>
    

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Courses</h2>
          <Link href="/admin/create-course" className="text-sky-600">Create course</Link>
        </div>

        <div className="mt-4 space-y-4">
          {courses.map(c => (
            <div key={c.id} className="p-4 bg-white rounded-md shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">{c.title} <span className="text-xs text-slate-500">({c.slug})</span></h3>
                  <p className="text-sm mt-1">{c.description}</p>
                </div>
                <div className="text-right">
                  <Link href={`/courses/${c.slug}`} className="text-sky-600 block mb-1">View</Link>
                  <ShowIfCanManage ownerId={c.ownerId}>
                  <Link href={`/admin/courses/${c.id}/add-module`} className="text-slate-600 block mb-1">Add module</Link>
                  <Link href={`/admin/courses/edit/${c.id}`} className="text-slate-600 block">Edit</Link>
                  
  <DeleteCourseButton courseId={c.id} />
                </ShowIfCanManage>
                </div>
              </div>

              {c.modules.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {c.modules.map(m => (
                    <li key={m.id} className="p-2 border rounded-md flex justify-between items-center">
                      <div>
                        <div className="font-medium">{m.order}. {m.title}</div>
                        <div className="text-xs text-slate-600">{m.content?.slice(0, 120) ?? 'No content'}</div>
                      </div>
                      <div className="flex gap-2">
                          <ShowIfCanManage ownerId={c.ownerId}>
                        <Link href={`/admin/modules/edit/${m.id}`} className="text-sky-600">Edit</Link>
                        <DeleteModuleButton moduleId={m.id} />
                        </ShowIfCanManage>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Users</h2>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map(u => (
            <div key={u.id} className="p-3 bg-white rounded-md shadow flex justify-between items-center">
              <div>
                <div className="font-medium">{u.name ?? u.email}</div>
                <div className="text-xs text-slate-600">{u.email}</div>
                <div className="text-xs mt-1">Role: <strong>{u.role}</strong></div>
              </div>
              <div>
                <PromoteUserButton userId={u.id} currentRole={u.role} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
