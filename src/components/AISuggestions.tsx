'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'

type Suggestion = {
  title: string
  description: string
  action: string
  link: string
}

export default function AISuggestions() {
  const { user } = useAuth()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])

  useEffect(() => {
    if (!user) return

    const aiSuggestions: Suggestion[] = []

    // 🎓 Student AI logic
    if (!user.role || user.role === 'STUDENT') {
      aiSuggestions.push(
        {
          title: 'Continue Learning',
          description: 'Resume or start a course that matches your interests.',
          action: 'Browse Courses',
          link: '/courses',
        },
        {
          title: 'Boost Completion',
          description: 'Completing one more module increases your progress significantly.',
          action: 'Go to Dashboard',
          link: '/dashboard',
        }
      )
    }

    // 🧑‍🏫 Instructor AI logic
    if (user.role === 'INSTRUCTOR') {
      aiSuggestions.push({
        title: 'Improve Course Quality',
        description: 'Courses with more modules have higher engagement.',
        action: 'Create Module',
        link: '/admin/dashboard',
      })
    }

    // 👑 Admin AI logic
    if (user.role === 'ADMIN') {
      aiSuggestions.push({
        title: 'System Insight',
        description: 'Recently promoted instructors may need onboarding.',
        action: 'View Users',
        link: '/admin/dashboard',
      })
    }

    setSuggestions(aiSuggestions)
  }, [user])

  if (!user || suggestions.length === 0) return null

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        🤖 AI Smart Suggestions
      </h2>

      <div className="space-y-4">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className="p-4 border rounded-lg hover:bg-slate-50 transition"
          >
            <h3 className="font-medium">{s.title}</h3>
            <p className="text-sm text-slate-600 mt-1">
              {s.description}
            </p>
            <a
              href={s.link}
              className="inline-block mt-2 text-sky-600 text-sm font-medium"
            >
              {s.action} →
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
