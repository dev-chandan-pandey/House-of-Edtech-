// src/lib/auth.ts
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { cookies } from 'next/headers'

export const COOKIE_NAME = 'hoej_session'

// -----------------------------
// 1. JWT payload
// -----------------------------
export interface JwtPayload {
  sub: string
  email?: string
  role?: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
  iat?: number
  exp?: number
}

// -----------------------------
// 2. Config
// -----------------------------
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const JWT_EXPIRES_IN = '7d'

// -----------------------------
// 3. Password helpers
// -----------------------------
export const hashPassword = async (password: string) =>
  bcrypt.hash(password, 10)

export const verifyPassword = async (password: string, hash: string) =>
  bcrypt.compare(password, hash)

// -----------------------------
// 4. JWT helpers
// -----------------------------
export const signJwt = (payload: JwtPayload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

export const verifyJwt = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

// -----------------------------
// 5. Read token (✅ NEXT 16 SAFE)
// -----------------------------
export const getTokenFromRequest = async (
  req?: Request
): Promise<string | null> => {
  // ✅ API Routes / Route Handlers
  if (req) {
    const cookieHeader = req.headers.get('cookie')
    if (!cookieHeader) return null

    const match = cookieHeader.match(
      new RegExp(`${COOKIE_NAME}=([^;]+)`)
    )
    return match?.[1] ?? null
  }

  // ✅ Server Components (Next.js 16)
  try {
    const cookieStore = await cookies()
    return cookieStore.get(COOKIE_NAME)?.value ?? null
  } catch {
    return null
  }
}

// -----------------------------
// 6. Build Set-Cookie header
// -----------------------------
export const buildSetCookie = (
  token: string,
  maxAge = 60 * 60 * 24 * 7
) => {
  const secure = process.env.NODE_ENV === 'production'
  const sameSite = 'Lax'

  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Max-Age=${maxAge}; SameSite=${sameSite}${
    secure ? '; Secure' : ''
  }`
}

// -----------------------------
// 7. Validation schemas
// -----------------------------
export const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  password: z.string().min(8),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})
