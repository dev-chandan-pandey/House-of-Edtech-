
// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { useAuth } from '@/context/AuthContext'

// export default function LoginPage() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [error, setError] = useState<string | null>(null)

//   const router = useRouter()
//   const { login, user, loading } = useAuth()

//   // 🔥 Redirect if already logged in
//   useEffect(() => {
//     if (!loading && user) {
//       router.replace('/dashboard') // replace avoids back-navigation to login
//     }
//   }, [user, loading, router])

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError(null)

//     const result = await login(email, password)

//     if (!result.ok) {
//       setError(result.error || 'Login failed')
//       return
//     }

//     router.replace('/dashboard')
//   }

//   // Optional: prevent flicker while auth state loads
//   if (loading) {
//     return <div className="p-6 text-center">Checking session…</div>
//   }

//   return (
//     <div className="max-w-md mx-auto mt-12">
//       <h2 className="text-2xl font-semibold mb-4">Login</h2>

//       <form onSubmit={handleSubmit} className="space-y-3">
//         <input
//           value={email}
//           onChange={e => setEmail(e.target.value)}
//           placeholder="Email"
//           className="input"
//           required
//         />

//         <input
//           value={password}
//           onChange={e => setPassword(e.target.value)}
//           placeholder="Password"
//           type="password"
//           className="input"
//           required
//         />

//         {error && <div className="text-red-600">{error}</div>}

//         <button className="btn w-full" type="submit">
//           Login
//         </button>
//       </form>
//     </div>
//   )
// }
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const { login, user, loading } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) router.replace('/dashboard')
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const res = await login(email, password)
    if (!res.ok) {
      setError(res.error || 'Invalid email or password')
      return
    }

    router.replace('/dashboard')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Checking session…</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-center">Welcome Back</h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          Login to continue learning
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email address"
            className="input w-full"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="input w-full"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}

          <button type="submit" className="btn w-full">
            Login
          </button>
        </form>

        <p className="text-sm text-center text-slate-600 mt-4">
          Don’t have an account?{' '}
          <button
            onClick={() => router.push('/register')}
            className="text-sky-600 hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  )
}
