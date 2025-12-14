export function generateCourseSummary(
  title: string,
  modules: { title: string; content?: string | null }[]
) {
  if (!modules.length) {
    return {
      overview: `This course "${title}" does not contain modules yet.`,
      highlights: [],
    }
  }

  // Collect keywords
  const keywords = new Set<string>()

  modules.forEach((m) => {
    m.title.split(' ').forEach(w => keywords.add(w))
    m.content?.split(' ').slice(0, 20).forEach(w => keywords.add(w))
  })

  const highlights = Array.from(keywords)
    .filter(w => w.length > 4)
    .slice(0, 6)

  const overview = `
"${title}" is a structured course consisting of ${modules.length} modules.
It progressively builds understanding through hands-on learning and clear explanations.
Learners will gain practical knowledge and confidence by completing this course.
`.trim()

  return { overview, highlights }
}
