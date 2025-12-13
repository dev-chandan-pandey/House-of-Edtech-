'use client'

import { useRouter } from 'next/navigation'

export default function DeleteModuleButton({ moduleId }: { moduleId: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Delete this module?')) return

    const res = await fetch(`/api/modules/${moduleId}`, {
      method: 'DELETE',
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Delete failed')
      return
    }

    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 text-xs"
    >
      Delete
    </button>
  )
}
