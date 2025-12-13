'use client'

import { useRouter } from 'next/navigation'

export default function BackToDashboardButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/dashboard')}
      className="btn"
    >
      ← Back to Dashboard
    </button>
  )
}
