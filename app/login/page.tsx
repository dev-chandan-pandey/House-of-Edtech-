
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const { login, user, loading } = useAuth()

  // 🔥 Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard') // replace avoids back-navigation to login
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const result = await login(email, password)

    if (!result.ok) {
      setError(result.error || 'Login failed')
      return
    }

    router.replace('/dashboard')
  }

  // Optional: prevent flicker while auth state loads
  if (loading) {
    return <div className="p-6 text-center">Checking session…</div>
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="input"
          required
        />

        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="input"
          required
        />

        {error && <div className="text-red-600">{error}</div>}

        <button className="btn w-full" type="submit">
          Login
        </button>
      </form>
    </div>
  )
}
