// src/tests/rbac.test.ts
import { requireRole, getUserFromRequest } from '@/src/lib/rbac'
import * as auth from '@/src/lib/auth'

describe('RBAC helper', () => {
  // mock token reading and verifyJwt
  const sampleToken = 'tokentest'
  const dummyReq = (cookie?: string) =>
    new Request('http://localhost', { headers: cookie ? { cookie } : {} })

  it('getUserFromRequest returns null when no cookie', () => {
    const out = getUserFromRequest()
    expect(out).toBeNull()
  })

  it('requireRole throws when not authenticated', () => {
    expect(() => requireRole(new Request('http://localhost'), ['ADMIN'])).toThrow('Unauthorized')
  })

  it('requireRole throws when role not allowed', () => {
    // spy verifyJwt to return student role
    jest.spyOn(auth, 'verifyJwt' as any).mockImplementation(() => ({ sub: 'u1', role: 'STUDENT' }))
    jest.spyOn(auth, 'getTokenFromRequest' as any).mockImplementation(() => 'anytoken')

    expect(() => requireRole(new Request('http://localhost'), ['INSTRUCTOR'])).toThrow('Forbidden')

    ;(auth.verifyJwt as jest.Mock).mockRestore && (auth.verifyJwt as jest.Mock).mockRestore()
    ;(auth.getTokenFromRequest as jest.Mock).mockRestore && (auth.getTokenFromRequest as jest.Mock).mockRestore()
  })

  it('requireRole returns user when allowed', () => {
    jest.spyOn(auth, 'verifyJwt' as any).mockImplementation(() => ({ sub: 'u1', role: 'INSTRUCTOR' }))
    jest.spyOn(auth, 'getTokenFromRequest' as any).mockImplementation(() => 'anytoken')

    const user = requireRole(new Request('http://localhost'), ['INSTRUCTOR', 'ADMIN'])
    expect(user).toBeDefined()
    expect(user?.role).toBe('INSTRUCTOR')

    ;(auth.verifyJwt as jest.Mock).mockRestore && (auth.verifyJwt as jest.Mock).mockRestore()
    ;(auth.getTokenFromRequest as jest.Mock).mockRestore && (auth.getTokenFromRequest as jest.Mock).mockRestore()
  })
})
