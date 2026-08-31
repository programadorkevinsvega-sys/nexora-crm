"use client"

import { useParams, useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Tabs } from "@/src/presentation/crm/components/ui/Tabs"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { EntityCard } from "@/src/presentation/crm/components/common/EntityCard"
import { StatusBadge } from "@/src/presentation/crm/components/common/StatusBadge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { TicketReplySection } from "@/src/presentation/crm/components/modules/tickets/ticket-reply-section"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useTicket, useDeleteTicket, useUpdateTicket } from "@src/application/crm/di/hooks"

export function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { tenantId } = useAuth()
  const [showDelete, setShowDelete] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const id = params.id as string

  const { data: ticket, isLoading, isError, error } = useTicket(id)

  const { mutate: deleteTicket } = useDeleteTicket()

  const { mutate: updateTicket } = useUpdateTicket()

  if (isError) return <ErrorState message={error?.message} />
  if (isLoading) return <Skeleton className="h-96" />
  if (!ticket) return <div className="text-body text-ash">Ticket not found</div>

  return (
    <div className="space-y-6">
      <PageHeader
        title={ticket.subject}
        breadcrumb={[
          { label: "Tickets", href: "/crm/tickets" },
          { label: ticket.subject },
        ]}
        actions={
          <div className="flex gap-2">
            {ticket.status === "OPEN" && (
              <Button variant="ghost" onClick={() => updateTicket({ id, data: { status: "RESOLVED" } })}>
                Resolve
              </Button>
            )}
            <Button variant="danger" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <Tabs
        tabs={[
          { id: "details", label: "Details" },
          { id: "replies", label: "Replies" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "details" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <EntityCard title="Ticket Information">
              <div className="space-y-4">
                <div>
                  <p className="text-caption text-ash">Description</p>
                  <p className="text-body text-paper mt-1 whitespace-pre-wrap">{ticket.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-steel">
                  <div>
                    <p className="text-caption text-ash">Status</p>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <div>
                    <p className="text-caption text-ash">Priority</p>
                    <Badge variant={ticket.priority === "CRITICAL" ? "danger" : ticket.priority === "HIGH" ? "warning" : "default"}>
                      {ticket.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            </EntityCard>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-body font-sans font-semibold text-paper mb-2">Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" onClick={() => updateTicket({ id, data: { status: "OPEN" } })}>Open</Button>
                <Button size="sm" variant="ghost" onClick={() => updateTicket({ id, data: { status: "PENDING" } })}>Pending</Button>
                <Button size="sm" variant="ghost" onClick={() => updateTicket({ id, data: { status: "RESOLVED" } })}>Resolved</Button>
                <Button size="sm" variant="ghost" onClick={() => updateTicket({ id, data: { status: "CLOSED" } })}>Closed</Button>
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="text-body font-sans font-semibold text-paper mb-2">Metadata</h3>
              <div className="space-y-2 text-caption text-ash">
                <p>Created: {new Date(ticket.createdAt).toLocaleDateString()}</p>
                <p>Updated: {new Date(ticket.updatedAt).toLocaleDateString()}</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "replies" && <TicketReplySection ticketId={id} />}

      <ConfirmDialog
        open={showDelete}
        title="Delete ticket"
        message={`Are you sure you want to delete "${ticket.subject}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteTicket(id, { onSuccess: () => router.push("/crm/tickets") })}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
export default TicketDetailPage
