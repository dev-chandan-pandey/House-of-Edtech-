#!/bin/bash

echo "🔥 Initializing House of EdTech project..."

# -------------------------------------------------------------------
# 1. Initialize npm and Next.js structure
# -------------------------------------------------------------------
npm init -y

echo "📦 Installing dependencies..."

# Production dependencies
npm install next@16 react@18 react-dom@18 \
  @prisma/client prisma \
  bcrypt jsonwebtoken zod \
  tailwindcss postcss autoprefixer

# Dev dependencies
npm install -D typescript ts-node ts-jest jest @types/jest \
  @types/node @types/jsonwebtoken @types/bcrypt \
  eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin \
  supertest

# -------------------------------------------------------------------
# 2. Create project folders
# -------------------------------------------------------------------
echo "📂 Creating folder structure..."

mkdir -p app/api/auth/login \
         app/api/auth/register \
         app/api/auth/me \
         app/dashboard \
         app/login \
         app/register \
         src/lib \
         src/context \
         src/tests \
         prisma

# -------------------------------------------------------------------
# 3. Generate all files
# -------------------------------------------------------------------

# ---------------------- package.json (already exists, overwrite) ----------------------
cat > package.json << 'EOF'
{
  "name": "house-of-edtech",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "eslint . --ext .ts,.tsx",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "ts-node --esm prisma/seed.ts",
    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "next": "16.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "zod": "^3.22.2"
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "typescript": "^5.5.0",
    "eslint": "^8.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "supertest": "^6.3.0",
    "ts-node": "^10.9.1",
    "@types/node": "^20.0.0",
    "@types/jsonwebtoken": "^9.0.0",
    "@types/bcrypt": "^5.0.0"
  }
}
EOF

# ---------------------- tsconfig.json ----------------------
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "types": ["node", "jest"]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", "prisma/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# ---------------------- next.config.js ----------------------
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true
  }
}

module.exports = nextConfig
EOF

# ---------------------- tailwind.config.js ----------------------
cat > tailwind.config.js << 'EOF'
module.exports = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./src/**/*.{ts,tsx,js,jsx}"
  ],
  theme: { extend: {} },
  plugins: []
}
EOF

# ---------------------- postcss.config.js ----------------------
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
EOF

# ---------------------- globals.css ----------------------
mkdir -p app
cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

.input { @apply w-full border px-3 py-2 rounded-md bg-white; }
.btn { @apply px-4 py-2 rounded-md bg-sky-600 text-white inline-block; }
EOF

# ---------------------- Prisma schema ----------------------
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  password    String
  role        Role     @default(STUDENT)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  progress    Progress[]
}

model Course {
  id          String   @id @default(cuid())
  title       String
  description String?
  slug        String   @unique
  modules     Module[]
  createdAt   DateTime @default(now())
}

model Module {
  id         String   @id @default(cuid())
  title      String
  content    String?
  course     Course   @relation(fields: [courseId], references: [id])
  courseId   String
  order      Int
}

model Progress {
  id         String   @id @default(cuid())
  user       User     @relation(fields: [userId], references: [id])
  userId     String
  course     Course   @relation(fields: [courseId], references: [id])
  courseId   String
  percent    Float    @default(0.0)
  updatedAt  DateTime @updatedAt
}

enum Role {
  ADMIN
  INSTRUCTOR
  STUDENT
}
EOF

# ---------------------- prisma/seed.ts ----------------------
cat > prisma/seed.ts << 'EOF'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice Student',
      password: '$2b$10$invalidhashforseedonly'
    }
  })
}
main().finally(() => prisma.$disconnect())
EOF

# ---------------------- Prisma client wrapper ----------------------
cat > src/lib/prisma.ts << 'EOF'
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query']
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
EOF

# ---------------------- Auth utilities ----------------------
cat > src/lib/auth.ts << 'EOF'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret'
const JWT_EXPIRES_IN = '7d'

export const hashPassword = async (password: string) => bcrypt.hash(password, 10)
export const verifyPassword = async (password: string, hash: string) => bcrypt.compare(password, hash)
export const signJwt = (payload: object) => jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
export const verifyJwt = (token: string) => {
  try { return jwt.verify(token, JWT_SECRET) } catch { return null }
}

export const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  password: z.string().min(8)
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})
EOF

# ---------------------- API routes ----------------------
cat > app/api/auth/register/route.ts << 'EOF'
import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { RegisterSchema, hashPassword } from '@/src/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = RegisterSchema.parse(body)

    const exists = await prisma.user.findUnique({ where: { email: parsed.email } })
    if (exists) return NextResponse.json({ error: 'User already exists' }, { status: 409 })

    const hashed = await hashPassword(parsed.password)
    const user = await prisma.user.create({
      data: { email: parsed.email, name: parsed.name, password: hashed },
      select: { id: true, email: true, name: true }
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
EOF

cat > app/api/auth/login/route.ts << 'EOF'
import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { LoginSchema, verifyPassword, signJwt } from '@/src/lib/auth'

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = LoginSchema.parse(body)

  const user = await prisma.user.findUnique({ where: { email: parsed.email } })
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const ok = await verifyPassword(parsed.password, user.password)
  if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const token = signJwt({ sub: user.id, email: user.email, role: user.role })

  return NextResponse.json({
    token,
    user: { id: user.id, email: user.email, name: user.name }
  })
}
EOF

cat > app/api/auth/me/route.ts << 'EOF'
import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { verifyJwt } from '@/src/lib/auth'

export async function GET(request: Request) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')

  const payload = verifyJwt(token)
  if (!payload) return NextResponse.json({ user: null }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, role: true }
  })

  return NextResponse.json({ user })
}
EOF

# ---------------------- Auth Context ----------------------
cat > src/context/AuthContext.tsx << 'EOF'
'use client'
import { createContext, useState, useEffect, useContext } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!token) return setUser(null)

    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
  }, [token])

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login: t => { localStorage.setItem('token', t); setToken(t) },
      logout: () => { localStorage.removeItem('token'); setUser(null); setToken(null) }
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
EOF

# ---------------------- Pages ----------------------
cat > app/layout.tsx << 'EOF'
import './globals.css'
import { AuthProvider } from '@/src/context/AuthContext'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <main className="min-h-screen bg-slate-50">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
EOF

cat > app/page.tsx << 'EOF'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">House of EdTech</h1>
      <p className="mt-2">Welcome to the learning platform.</p>
      <div className="mt-4 flex gap-4">
        <Link href="/register" className="btn">Register</Link>
        <Link href="/login" className="btn">Login</Link>
      </div>
    </div>
  )
}
EOF

cat > app/register/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const submit = async e => {
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
EOF

cat > app/login/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/context/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const submit = async e => {
    e.preventDefault()
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (!res.ok) return setError(data.error)

    login(data.token)
    router.push('/dashboard')
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <form className="space-y-3" onSubmit={submit}>
        <input className="input" placeholder="Email"
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <input className="input" placeholder="Password" type="password"
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="text-red-600">{error}</p>}
        <button className="btn">Login</button>
      </form>
    </div>
  )
}
EOF

cat > app/dashboard/page.tsx << 'EOF'
'use client'
import { useAuth } from '@/src/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, token, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!token) router.push('/login')
  }, [token])

  if (!user) return <p className="p-6">Loading...</p>

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Hello, {user.name ?? user.email}</h1>
      <p className="text-gray-600">Role: {user.role}</p>
      <button className="btn mt-4"
        onClick={() => { logout(); router.push('/') }}>
        Logout
      </button>
    </div>
  )
}
EOF

# ---------------------- Jest config ----------------------
cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts']
}
EOF

# ---------------------- Auth test ----------------------
cat > src/tests/auth.test.ts << 'EOF'
import { hashPassword, verifyPassword, signJwt, verifyJwt } from '@/src/lib/auth'

test('hash and verify password', async () => {
  const hash = await hashPassword('password123')
  expect(await verifyPassword('password123', hash)).toBe(true)
})

test('sign and verify jwt', () => {
  const token = signJwt({ sub: '123' })
  const payload = verifyJwt(token)
  expect(payload.sub).toBe('123')
})
EOF

# ---------------------- ESLint config ----------------------
cat > .eslintrc.json << 'EOF'
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "env": { "browser": true, "es2021": true, "node": true, "jest": true }
}
EOF

# ---------------------- .env.example ----------------------
cat > .env.example << 'EOF'
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/house_of_edtech"
JWT_SECRET="replace-this-with-a-strong-secret"
EOF

echo "⚙️ Generating Prisma client..."
npx prisma generate

echo "🎉 Setup complete! Run the development server with:"
echo ""
echo "   npm run dev"
echo ""
