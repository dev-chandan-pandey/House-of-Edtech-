'use client'

import { useRouter } from 'next/navigation'

export default function DeleteCourseButton({ courseId }: { courseId: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    const ok = confirm(
      'Delete this course?\n\nAll its modules will also be deleted.'
    )
    if (!ok) return

    const res = await fetch(`/api/courses/${courseId}`, {
      method: 'DELETE',
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Delete failed')
      return
    }

    router.refresh() // 🔥 re-fetch server component
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 text-sm"
    >
      Delete
    </button>
  )
}
