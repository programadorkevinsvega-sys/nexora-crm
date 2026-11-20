import { CustomerPortalTicketPage } from "@/src/presentation/crm/components/pages/portal/customer-portal-ticket-page"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <CustomerPortalTicketPage ticketId={id} />
}
