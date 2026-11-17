"use client"

import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { useAuth } from "@/src/presentation/hooks/use-auth"

export function AgentListPage() {
  const { tenantId } = useAuth()

  if (!tenantId) return <Skeleton className="h-96" />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Agents"
        description="Helpdesk agent profiles"
      />

      <Card className="p-6">
        <EmptyState
          title="Agent Management"
          description="Agent profile management coming soon"
        />
      </Card>
    </div>
  )
}
export default AgentListPage
