
'use client'
import React, { createContext, useState, useEffect, useContext } from 'react'

interface UserType {
  id?: string
  name?: string
  email?: string
  role?: string
}

interface AuthContextType {
  user: UserType | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user from cookie on startup
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        setUser(data.user ?? null)
        setLoading(false)
      })
      .catch(() => {
        setUser(null)
        setLoading(false)
      })
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await res.json()
    if (!res.ok) {
      return { ok: false, error: data.error || 'Login failed' }
    }

    // Wait for the cookie to be stored by browser
    await new Promise(r => setTimeout(r, 50))

    // Re-fetch user
    const me = await fetch('/api/auth/me').then(r => r.json())
    setUser(me.user ?? null)

    return { ok: true }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }
const refreshUser = async () => {
  try {
    const res = await fetch('/api/auth/me')
    const data = await res.json()
    if (data.user) {
      setUser(data.user)
    }
  } catch {
    setUser(null)
  }
}

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
