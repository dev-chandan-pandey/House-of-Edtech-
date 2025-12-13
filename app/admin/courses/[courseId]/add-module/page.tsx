
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import AddModuleForm from './AddModuleForm'

export default async function AddModulePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  })

  if (!course) notFound()

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        Add Module to {course.title}
      </h1>

      <AddModuleForm courseId={courseId} />
    </div>
  )
}
