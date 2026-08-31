"use client"

import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useMailboxesList } from "@src/application/crm/di/hooks"

export function MailboxListPage() {
  const { tenantId } = useAuth()

  const { data, isLoading, isError, error } = useMailboxesList()

  if (!tenantId) return <Skeleton className="h-96" />
  if (isError) return <ErrorState message={error?.message} />

  return (
    <div className="space-y-4">
      <PageHeader title="Mailboxes" description="Manage helpdesk mailboxes" />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : data && data.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((mailbox: any) => (
            <Card key={mailbox.id} className="p-4 space-y-3">
              <h3 className="text-body font-sans font-semibold text-paper">{mailbox.name}</h3>
              <p className="text-caption text-ash">{mailbox.emailAddress}</p>
              <Badge variant={mailbox.isActive ? "success" : "default"}>
                {mailbox.isActive ? "Active" : "Inactive"}
              </Badge>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No mailboxes found" />
      )}
    </div>
  )
}
export default MailboxListPage
