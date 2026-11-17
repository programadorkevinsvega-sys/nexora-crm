import { PublicMeetPage } from '@src/presentation/crm/components/pages/booking/public-meet-page'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <PublicMeetPage slug={slug} />
}
