'use client'
import { useState } from 'react'

type Props = {
  overview: string
  highlights: string[]
}

export default function AICourseSummary({ overview, highlights }: Props) {
  const [open, setOpen] = useState(true)

  return (
    <div className="mt-6 border rounded-lg bg-indigo-50 p-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-indigo-700">
          🤖 AI Course Summary
        </h3>
        <button
          onClick={() => setOpen(!open)}
          className="text-sm text-indigo-600 underline"
        >
          {open ? 'Hide' : 'Show'}
        </button>
      </div>

      {open && (
        <>
          <p className="mt-3 text-sm text-slate-700">{overview}</p>

          <ul className="mt-3 list-disc list-inside text-sm text-slate-600">
            {highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
