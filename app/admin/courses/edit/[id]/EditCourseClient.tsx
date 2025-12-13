// app/admin/courses/edit/[id]/EditCourseClient.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Course = {
  id: string
  title: string
  description?: string | null
  slug: string
}

export default function EditCourseClient({ id }: { id: string }) {
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ---------------------------
  // Fetch course
  // ---------------------------
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/courses/${id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setCourse(data.course)
      } catch (err: any) {
        setError(err.message || 'Failed to load course')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // ---------------------------
  // Save handler
  // ---------------------------
  const handleSave = async () => {
    if (!course) return
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')

      router.push('/admin/dashboard')
      router.refresh() // 🔥 invalidate server cache
    } catch (err: any) {
      setError(err.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  // ---------------------------
  // UI states
  // ---------------------------
  if (loading) return <div className="p-6">Loading…</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!course) return null

  return (
    <form
      className="max-w-xl p-6 space-y-4"
      onSubmit={e => {
        e.preventDefault()
        handleSave()
      }}
    >
      <input
        className="input w-full"
        value={course.title}
        onChange={e => setCourse({ ...course, title: e.target.value })}
      />

      <input
        className="input w-full"
        value={course.slug}
        onChange={e => setCourse({ ...course, slug: e.target.value })}
      />

      <textarea
        className="input w-full"
        value={course.description ?? ''}
        onChange={e =>
          setCourse({ ...course, description: e.target.value })
        }
      />

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <button className="btn" disabled={saving}>
        {saving ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
