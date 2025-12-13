
// app/dashboard/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [loading, user, router])

  if (loading) return <p className="p-6">Loading...</p>
  if (!user) return null

  const isAdmin = user.role === 'ADMIN'
  const isInstructor = user.role === 'INSTRUCTOR'
  const isStudent = user.role === 'STUDENT' || !user.role

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Hello, {user.name ?? user.email}</h1>
      <p className="text-gray-600 mt-1">Role: <strong>{user.role ?? 'STUDENT'}</strong></p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-md shadow">
          <h2 className="font-semibold">General</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <button className="text-sky-600" onClick={() => router.push('/courses')}>
                Browse Courses
              </button>
            </li>
            <li>
              <button className="text-sky-600" onClick={() => router.push('/profile')}>
                Profile (coming soon)
              </button>
            </li>
            <li>
              <button
                className="btn mt-2"
                onClick={async () => {
                  await logout()
                  router.push('/')
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>

        <div className="p-4 bg-white rounded-md shadow">
          <h2 className="font-semibold">Your shortcuts</h2>
          <div className="mt-3 space-y-2 text-sm">
            {isStudent && (
              <>
                <div>Student actions</div>
                <button className="text-sky-600" onClick={() => router.push('/courses')}>Find & start a course</button>
                <div className="text-xs text-slate-500 mt-1">After starting, module completion buttons appear on the course page.</div>
              </>
            )}

            {(isInstructor || isAdmin) && (
              <>
                <div>Instructor / Admin actions</div>
                <div>
                  <button className="text-sky-600" onClick={() => router.push('/admin/create-course')}>Create Course</button>
                </div>
                <div>
                  <button className="text-sky-600" onClick={() => router.push('/admin/dashboard')}>Admin Dashboard</button>
                </div>
              </>
            )}

            {isAdmin && (
              <div>
                <button className="text-red-600" onClick={() => router.push('/admin/deleted')}>Deleted Items (Restore)</button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-white rounded-md shadow md:col-span-2">
          <h2 className="font-semibold">Quick diagnostics</h2>
          <div className="mt-3 text-sm">
            <p className="text-slate-600">If you don’t see instructor/admin links but expect to:</p>
            <ol className="list-decimal list-inside ml-4 mt-2 text-xs">
              <li>Confirm you logged into the correct account (email).</li>
              <li>Open <code>/api/auth/me</code> in devtools (Network) — it must return your user object with <code>role</code>.</li>
              <li>If role is missing/wrong, open Prisma Studio: <code>npx prisma studio</code> and verify the <code>role</code> field for your user.</li>
              <li>Make sure server was restarted after migrations / seed (if you changed DB schema).</li>
            </ol>
            <div className="mt-3">
              <button
                className="btn"
                onClick={async () => {
                  setMessage('Checking /api/auth/me — look at network console')
                  try {
                    const res = await fetch('/api/auth/me')
                    const data = await res.json()
                    setMessage(JSON.stringify(data.user ?? data, null, 2))
                  } catch (err: any) {
                    setMessage('Fetch failed: ' + (err?.message ?? 'unknown'))
                  }
                }}
              >
                Check my user (GET /api/auth/me)
              </button>
              {message && <pre className="mt-3 p-3 bg-slate-50 rounded text-xs overflow-auto">{message}</pre>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
