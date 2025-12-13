// // app/admin/modules/edit/[id]/page.tsx


import EditModuleClient from './EditModuleClient'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EditModuleClient id={id} />
}
