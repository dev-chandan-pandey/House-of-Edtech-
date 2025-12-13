'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (!res.ok) return setError(data.error)

    router.push('/login')
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      <form className="space-y-3" onSubmit={submit}>
        <input className="input" placeholder="Name"
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input className="input" placeholder="Email"
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <input className="input" placeholder="Password" type="password"
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="text-red-600">{error}</p>}
        <button className="btn">Register</button>
      </form>
    </div>
  )
}
