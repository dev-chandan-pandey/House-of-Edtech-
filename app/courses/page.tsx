

// app/courses/page.tsx
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const revalidate = 60

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: { modules: { where: { deletedAt: null } } }
  })

  return (
    <div className="container mx-auto py-8 px-4">
    
        <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Courses</h1>
            {/* rest unchanged */}
            <Link href="/dashboard" className="btn flex items-center gap-2">
        ← Dashboard
      </Link>
            </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map(c => (
          <div key={c.id} className="p-4 bg-white rounded-md shadow">
            <h2 className="text-lg font-semibold">{c.title}</h2>
            <p className="text-sm mt-2">{c.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs">{c.modules.length} modules</span>
              <Link href={`/courses/${c.slug}`} className="text-sky-600">View</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
