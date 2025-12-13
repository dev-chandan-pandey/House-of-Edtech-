


// src/lib/rbac.ts
import { getTokenFromRequest, verifyJwt } from './auth'
import type { JwtPayload } from './auth'

/** Get user payload from a Request (server route) */
export const getUserFromRequest = async (
  request?: Request
): Promise<JwtPayload | null> => {
  const token = await getTokenFromRequest(request)
  if (!token) return null

  const payload = verifyJwt(token)
  return payload ?? null
}

/** Require authenticated user and return payload or throw */
export const requireAuth = async (request: Request | undefined) => {
  const user = await getUserFromRequest(request)
  if (!user) {
    const err = new Error('Unauthorized')
    ;(err as any).status = 401
    throw err
  }
  return user
}

/** Require authentication + correct role */
export const requireRole = async (
  request: Request | undefined,
  allowedRoles: string[] = []
): Promise<JwtPayload> => {
  const user = await getUserFromRequest(request)
  if (!user) {
    const err = new Error('Unauthorized')
    ;(err as any).status = 401
    throw err
  }

  if (!allowedRoles.includes(user.role ?? '')) {
    const err = new Error('Forbidden')
    ;(err as any).status = 403
    throw err
  }

  return user
}

/** Check ownership: returns true if user is ADMIN or user.sub === ownerId */
export const checkOwnershipOrAdmin = (
  user: { sub: string; role?: string } | null,
  ownerId: string
) => {
  if (!user) return false
  if (user.role === 'ADMIN') return true
  return user.sub === ownerId
}
