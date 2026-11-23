"use client"

import { useParams, useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Tabs } from "@/src/presentation/crm/components/ui/Tabs"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { StatusBadge } from "@/src/presentation/crm/components/common/StatusBadge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { ThreadTimeline } from "@/src/presentation/crm/components/modules/helpdesk/thread-timeline"
import { ConversationSidebar } from "@/src/presentation/crm/components/modules/helpdesk/conversation-sidebar"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useConversation, useResolveConversation, useAssignConversation } from "@src/application/crm/di/hooks"
import { container } from "@src/application/crm/di/container"
import { DI_TOKENS } from "@src/application/crm/di/tokens"

export function ConversationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [showDelete, setShowDelete] = useState(false)
  const [activeTab, setActiveTab] = useState("threads")
  const id = params.id as string

  const { data: conversation, isLoading, isError, error } = useConversation(id)

  const handleDelete = async () => {
    const repo = container.resolve<any>(DI_TOKENS.HelpdeskRepository)
    await repo.delete(id)
    router.push("/support/helpdesk/conversations")
  }

  const { mutate: assignConversation } = useAssignConversation()

  const { mutate: resolveConversation } = useResolveConversation()

  if (isError) return <ErrorState message={error?.message} />
  if (isLoading) return <Skeleton className="h-96" />
  if (!conversation) return <div className="text-body text-ash">Conversation not found</div>

  return (
    <div className="space-y-6">
      <PageHeader
        title={conversation.subject}
        breadcrumb={[
          { label: "Conversations", href: "/support/helpdesk/conversations" },
          { label: conversation.subject },
        ]}
        actions={
          <div className="flex gap-2">
            {conversation.status !== "RESOLVED" && conversation.status !== "CLOSED" && (
              <Button variant="ghost" onClick={() => resolveConversation(id)}>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs
            tabs={[
              { id: "threads", label: "Threads" },
              { id: "details", label: "Details" },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          {activeTab === "threads" && <ThreadTimeline conversationId={id} />}
          {activeTab === "details" && (
            <Card className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-caption text-ash">Status</p>
                  <StatusBadge status={conversation.status} />
                </div>
                <div>
                  <p className="text-caption text-ash">Priority</p>
                  <Badge variant={conversation.priority === "CRITICAL" ? "danger" : conversation.priority === "HIGH" ? "warning" : "default"}>
                    {conversation.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-caption text-ash">Customer Email</p>
                  <p className="text-body text-paper">{conversation.customerEmail}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Source</p>
                  <p className="text-body text-paper">{conversation.sourceChannel}</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <ConversationSidebar conversation={conversation} onAssign={(userId) => assignConversation({ id, agentId: userId })} />
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete conversation"
        message={`Are you sure you want to delete this conversation?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
export default ConversationDetailPage
