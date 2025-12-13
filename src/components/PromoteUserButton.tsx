
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

type Props = {
  userId: string
  currentRole?: string | null
}

const ROLES = ['STUDENT', 'INSTRUCTOR', 'ADMIN']

export default function PromoteUserButton({ userId, currentRole }: Props) {
   const { refreshUser } = useAuth()
  const router = useRouter()
  const [role, setRole] = useState(currentRole ?? 'STUDENT')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const promote = async (newRole: string) => {
    if (newRole === role) return

    setLoading(true)
    setMsg(null)

    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMsg(data.error || 'Failed')
        return
      }

      setRole(newRole)
      setMsg('Updated ✅')
      await refreshUser() // 🔥 refresh AuthContext user
      router.refresh() // 🔥 refresh AdminDashboard
    } catch {
      setMsg('Error')
    } finally {
      setLoading(false)
      setTimeout(() => setMsg(null), 2000)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={role}
        disabled={loading}
        onChange={(e) => promote(e.target.value)}
        className="border px-2 py-1 rounded"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      {loading && <span className="text-xs">Saving…</span>}
      {msg && <span className="text-xs">{msg}</span>}
    </div>
  )
}
