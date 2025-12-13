
'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">House of EdTech</h1>
      <p className="mt-2">Welcome to the learning platform.</p>

      <div className="mt-4 flex gap-4">
        {/* ✅ If NOT logged in */}
        {!user && (
          <>
            <Link href="/register" className="btn">
              Register
            </Link>
            <Link href="/login" className="btn">
              Login
            </Link>
          </>
        )}

        {/* ✅ If logged in */}
        {user && (
          <>
            <button
              className="btn"
              onClick={async () => {
                await logout()
                router.push('/')
              }}
            >
              Logout
            </button>

            <Link href="/dashboard" className="btn">
              Dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
