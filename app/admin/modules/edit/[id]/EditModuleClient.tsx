// app/admin/modules/edit/[id]/EditModuleClient.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Module = {
  id: string
  title: string
  content?: string | null
  order?: number
}

export default function EditModuleClient({ id }: { id: string }) {
  const router = useRouter()
  const [module, setModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ---------------------------
  // Fetch module
  // ---------------------------
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/modules/${id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setModule(data.module)
      } catch (err: any) {
        setError(err.message || 'Failed to load module')
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
    if (!module) return
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/modules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(module),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')

      router.push('/admin/dashboard')
      router.refresh()
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
  if (!module) return null

  return (
    <form
      className="p-6 space-y-4"
      onSubmit={e => {
        e.preventDefault()
        handleSave()
      }}
    >
      <input
        className="input w-full"
        value={module.title}
        onChange={e => setModule({ ...module, title: e.target.value })}
      />

      <textarea
        className="input w-full"
        value={module.content ?? ''}
        onChange={e =>
          setModule({ ...module, content: e.target.value })
        }
      />

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <button className="btn" disabled={saving}>
        {saving ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
