// // src/components/ShowIfCanManage.tsx
// 'use client'
// import React, { useEffect, useState } from 'react'

// type Props = {
//   ownerId: string
//   children: React.ReactNode
//   fallback?: React.ReactNode
// }

// /**
//  * Show children only if current user is owner (ownerId) or has role ADMIN.
//  * Uses /api/auth/me (cookie-based auth).
//  */
// export default function ShowIfCanManage({ ownerId, children, fallback = null }: Props) {
//   const [allowed, setAllowed] = useState<boolean | null>(null)

//   useEffect(() => {
//     let mounted = true
//     fetch('/api/auth/me')
//       .then(r => r.json())
//       .then(data => {
//         if (!mounted) return
//         const user = data.user
//         if (!user) return setAllowed(false)
//         if (user.role === 'ADMIN') return setAllowed(true)
//         if (user.id === ownerId) return setAllowed(true)
//         return setAllowed(false)
//       })
//       .catch(() => { if (mounted) setAllowed(false) })
//     return () => { mounted = false }
//   }, [ownerId])

//   if (allowed === null) return null // or loader
//   return <>{allowed ? children : fallback}</>
// }

// src/components/ShowIfCanManage.tsx
'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'

type Props = {
  ownerId: string
  children: ReactNode
  fallback?: ReactNode
}

export default function ShowIfCanManage({
  ownerId,
  children,
  fallback = null,
}: Props) {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) return <>{fallback}</>

  const allowed =
    user.role === 'ADMIN' || user.id === ownerId

  return <>{allowed ? children : fallback}</>
}
