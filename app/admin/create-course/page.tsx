// app/admin/create-course/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateCoursePage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ---------------------------
  // Create handler
  // ---------------------------
  const handleCreate = async () => {
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          description,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Could not create course')
      }

      // Go to dashboard (or course page if you prefer)
      router.push('/admin/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Create Course</h2>

      <form
        className="space-y-3"
        onSubmit={e => {
          e.preventDefault()
          handleCreate()
        }}
      >
        <input
          className="input w-full"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />

        <input
          className="input w-full"
          placeholder="Slug (url-friendly)"
          value={slug}
          onChange={e => setSlug(e.target.value)}
          required
        />

        <textarea
          className="input w-full"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create Course'}
        </button>
      </form>
    </div>
  )
}
