import { CustomerPortalHelpPage } from "@/src/presentation/crm/components/pages/portal/customer-portal-help-page"

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <CustomerPortalHelpPage articleSlug={slug} />
}
