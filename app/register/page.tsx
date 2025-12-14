// 'use client'
// import { useState } from 'react'
// import { useRouter } from 'next/navigation'

// export default function RegisterPage() {
//   const router = useRouter()
//   const [form, setForm] = useState({ name: '', email: '', password: '' })
//   const [error, setError] = useState('')

//   const submit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//     const res = await fetch('/api/auth/register', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(form)
//     })
//     const data = await res.json()
//     if (!res.ok) return setError(data.error)

//     router.push('/login')
//   }

//   return (
//     <div className="max-w-md mx-auto mt-12">
//       <h2 className="text-xl font-bold mb-4">Register</h2>
//       <form className="space-y-3" onSubmit={submit}>
//         <input className="input" placeholder="Name"
//           onChange={e => setForm({ ...form, name: e.target.value })}
//         />
//         <input className="input" placeholder="Email"
//           onChange={e => setForm({ ...form, email: e.target.value })}
//         />
//         <input className="input" placeholder="Password" type="password"
//           onChange={e => setForm({ ...form, password: e.target.value })}
//         />
//         {error && <p className="text-red-600">{error}</p>}
//         <button className="btn">Register</button>
//       </form>
//     </div>
//   )
// }
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password })
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Registration failed')
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 800)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-center">Create Account</h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          Start your learning journey
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            placeholder="Full name (optional)"
            className="input w-full"
            value={name}
            onChange={e => setName(e.target.value)}
          />

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
            placeholder="Password (min 8 chars)"
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

          {success && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
              Account created! Redirecting…
            </div>
          )}

          <button type="submit" className="btn w-full">
            Register
          </button>
        </form>

        <p className="text-sm text-center text-slate-600 mt-4">
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-sky-600 hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  )
}
