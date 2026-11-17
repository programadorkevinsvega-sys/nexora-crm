import { PublicQuoteAcceptPage } from '@/src/presentation/crm/components/pages/quotes-approval/public-quote-accept-page'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ token: string }>
}

export default async function Page({ params }: Props) {
  const resolved = await params
  return <PublicQuoteAcceptPage token={resolved.token} />
}
