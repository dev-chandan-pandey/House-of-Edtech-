
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddModuleForm({ courseId }: { courseId: string }) {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [order, setOrder] = useState(1)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // -----------------------
  // Handler
  // -----------------------
  const handleAddModule = async () => {
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const res = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          order,
          courseId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add module')
      }

      setSuccess(true)

      // Reset form (optional)
      setTitle('')
      setContent('')
      setOrder(order + 1)

      // 🔥 Refresh server components (dashboard, course page)
     router.push('/admin/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // -----------------------
  // Render
  // -----------------------
  return (
    <form
      className="space-y-4 max-w-md"
      onSubmit={e => {
        e.preventDefault()
        handleAddModule()
      }}
    >
      <input
        type="text"
        placeholder="Module Title"
        className="input w-full"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />

      <textarea
        placeholder="Content"
        className="input w-full"
        value={content}
        onChange={e => setContent(e.target.value)}
      />

      <input
        type="number"
        className="input w-full"
        value={order}
        onChange={e => setOrder(Number(e.target.value))}
        min={1}
        required
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Module added</p>}

      <button className="btn" type="submit" disabled={loading}>
        {loading ? 'Adding…' : 'Add Module'}
      </button>
    </form>
  )
}
