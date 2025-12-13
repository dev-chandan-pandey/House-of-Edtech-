
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  type: 'course' | 'module'
  id: string
}

export default function RestoreButton({ type, id }: Props) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const router = useRouter()

  const handleRestore = async () => {
    if (!confirm('Restore this item?')) return

    setLoading(true)
    setMsg(null)

    try {
      const res = await fetch(`/api/${type}s/${id}/restore`, {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        setMsg(data.error || 'Restore failed')
        return
      }

      setMsg('Restored ✅')

      // 🔥 THIS is how you refresh server data
      router.refresh()
    } catch (err: any) {
      setMsg(err?.message ?? 'Error')
    } finally {
      setLoading(false)
      setTimeout(() => setMsg(null), 2000)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRestore}
        disabled={loading}
        className="btn px-3 py-1"
      >
        {loading ? 'Restoring...' : 'Restore'}
      </button>

      {msg && <span className="text-sm">{msg}</span>}
    </div>
  )
}
