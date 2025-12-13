// src/tests/courseSchema.test.ts
import { z } from 'zod'
import { describe, expect, it } from '@jest/globals'
import { prisma } from '@/src/lib/prisma'
import { expect as expectJest } from '@jest/globals'

// Reuse the CreateCourse zod schema defined inline here to avoid importing route file
const CreateCourse = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  slug: z.string().min(3)
})

describe('Course Create schema', () => {
  it('accepts valid input', () => {
    const input = { title: 'Test Course', slug: 'test-course' }
    const parsed = CreateCourse.parse(input)
    expect(parsed.title).toBe('Test Course')
  })

  it('rejects short title or slug', () => {
    const bad = { title: 'ab', slug: 'x' }
    expect(() => CreateCourse.parse(bad)).toThrow()
  })
})
