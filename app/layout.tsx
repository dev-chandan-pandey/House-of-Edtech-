import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { ReactNode } from 'react'
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <main className="min-h-screen bg-slate-50">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
