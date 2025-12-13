// // app/admin/courses/edit/[id]/page.tsx


import EditCourseClient from './EditCourseClient'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EditCourseClient id={id} />
}
