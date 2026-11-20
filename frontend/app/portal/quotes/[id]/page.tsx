import { CustomerPortalQuotePage } from "@/src/presentation/crm/components/pages/portal/customer-portal-quote-page"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <CustomerPortalQuotePage quoteId={id} />
}
