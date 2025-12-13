// src/components/StartCourseButton.tsx
'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  courseId: string
}

export default function StartCourseButton({ courseId }: Props) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const router = useRouter()

  const start = async () => {
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      })
      const data = await res.json()
      if (!res.ok) {
        setMsg(data.error || 'Failed to start')
      } else {
        setMsg('Enrolled — progress created')
        // optionally redirect to dashboard or first module
        setTimeout(() => {
          router.refresh()
        }, 700)
      }
    } catch (err: any) {
      setMsg(err?.message ?? 'Network error')
    } finally {
      setLoading(false)
      setTimeout(() => setMsg(null), 2000)
    }
  }

  return (
    <div className="inline-flex items-center gap-3">
      <button onClick={start} disabled={loading} className="btn">
        {loading ? 'Starting...' : 'Start Course'}
      </button>
      {msg && <span className="text-sm">{msg}</span>}
    </div>
  )
}
