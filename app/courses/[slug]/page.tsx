// app/courses/[slug]/page.tsx

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import StartCourseButton from '@/components/StartCourseButton'
import MarkModuleCompleteButton from '@/components/MarkModuleCompleteButton'
import { verifyJwt, COOKIE_NAME } from '@/lib/auth'
import BackToCoursesButton from '@/components/BackToCoursesButton'
import { generateCourseSummary } from '@/lib/aiCourseSummary'
import AICourseSummary from '@/components/AICourseSummary'

export const revalidate = 60

export default async function CourseDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!slug) notFound()

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        where: { deletedAt: null },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!course || course.deletedAt) notFound()

  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value ?? null

  let progress: { id: string; percent: number } | null = null

  if (token) {
    const payload = verifyJwt(token)
    if (payload?.sub) {
      const p = await prisma.progress.findFirst({
        where: {
          courseId: course.id,
          userId: payload.sub,
        },
      })
      if (p) progress = { id: p.id, percent: p.percent }
    }
  }

  const perModulePercent =
    course.modules.length > 0
      ? Math.round(100 / course.modules.length)
      : 100

  // 🔥 AI SUMMARY (SERVER-SIDE)
  const aiSummary = generateCourseSummary(
    course.title,
    course.modules
  )

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold">{course.title}</h1>
      <p className="mt-2 text-slate-700">{course.description}</p>

      {/* ACTION BUTTONS */}
      <div className="mt-4">
        {!progress ? (
          <StartCourseButton courseId={course.id} />
        ) : (
          <BackToCoursesButton />
        )}
      </div>
{/* 🤖 AI Progress Tips */}
{progress && progress.percent < 50 && (
  <div className="mt-4 p-3 bg-yellow-50 border rounded text-sm">
    💡 <strong>AI Tip:</strong> You’re halfway there! Focus on completing the next 2 modules to build momentum.
  </div>
)}

{progress && progress.percent >= 50 && progress.percent < 100 && (
  <div className="mt-4 p-3 bg-green-50 border rounded text-sm">
    🚀 <strong>AI Tip:</strong> Great progress! You’re close to completing this course.
  </div>
)}

      {/* 🤖 AI COURSE SUMMARY */}
      <AICourseSummary
        overview={aiSummary.overview}
        highlights={aiSummary.highlights}
      />

      {/* MODULES */}
      <ul className="mt-6 space-y-2">
        {course.modules.map((m) => (
          <li
            key={m.id}
            className="p-3 bg-white rounded shadow flex justify-between"
          >
            <div>
              <strong>
                {m.order}. {m.title}
              </strong>
              <p className="text-sm text-slate-600">
                {m.content ?? 'No content'}
              </p>
            </div>

            {progress && (
              <MarkModuleCompleteButton
                progressId={progress.id}
                incrementPercent={perModulePercent}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
