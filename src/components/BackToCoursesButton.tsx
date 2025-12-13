'use client'

import { useRouter } from 'next/navigation'

export default function BackToCoursesButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/courses')}
      className="btn"
    >
      ← Back to Courses
    </button>
  )
}
