import { AutomationDetailPage } from "@/src/presentation/crm/components/pages/automations/automation-detail-page"

export default async function AutomationDetailPageWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <AutomationDetailPage id={id} />
}
