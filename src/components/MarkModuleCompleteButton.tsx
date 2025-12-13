
// src/components/MarkModuleCompleteButton.tsx
'use client'

import React, { useState } from 'react'

type Props = {
  progressId: string
  incrementPercent?: number
}

export default function MarkModuleCompleteButton({
  progressId,
  incrementPercent = 10,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const handle = async () => {
    setLoading(true)
    setMsg(null)

    try {
      // Fetch current progress first
      const currentRes = await fetch(`/api/progress/${progressId}`)
      let currentPercent = 0

      if (currentRes.ok) {
        const currentData = await currentRes.json()
        currentPercent = currentData.progress?.percent ?? 0
      }

      // Calculate new percent
      const newPercent = Math.min(100, currentPercent + incrementPercent)

      // Update progress
      const res = await fetch(`/api/progress/${progressId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ percent: newPercent }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMsg(data.error || 'Failed to update progress')
      } else {
        setMsg('Marked complete')
        // Refresh page to show updated progress
        setTimeout(() => window.location.reload(), 500)
      }
    } catch (err: any) {
      setMsg(err?.message ?? 'Error updating progress')
    } finally {
      setLoading(false)
      setTimeout(() => setMsg(null), 1500)
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button onClick={handle} disabled={loading} className="btn">
        {loading ? 'Updating...' : 'Mark Module Complete'}
      </button>
      {msg && <span className="text-sm">{msg}</span>}
    </div>
  )
}
