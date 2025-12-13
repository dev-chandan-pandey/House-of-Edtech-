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
