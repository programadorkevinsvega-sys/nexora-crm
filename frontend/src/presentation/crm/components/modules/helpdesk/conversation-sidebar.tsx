"use client"

import { Card } from "@/src/presentation/crm/components/ui/Card"
import { StatusBadge } from "@/src/presentation/crm/components/common/StatusBadge"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import type { Conversation } from "@/src/domain/crm/helpdesk/conversation.entity"

export interface ConversationSidebarProps {
  conversation: Conversation
  onAssign: (userId: string) => void
}

export function ConversationSidebar({ conversation, onAssign }: ConversationSidebarProps) {
  const hours = conversation.estimatedHours ?? 0
  const worked = conversation.workedHours ?? 0
  const percent = hours > 0 ? Math.round((worked / hours) * 100) : 0

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <h3 className="text-body font-sans font-semibold text-paper">Details</h3>
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
          <p className="text-caption text-ash">Source</p>
          <p className="text-body text-paper">{conversation.sourceChannel}</p>
        </div>
        {conversation.dueDate && (
          <div>
            <p className="text-caption text-ash">Due Date</p>
            <p className="text-body text-paper">{new Date(conversation.dueDate).toLocaleDateString()}</p>
          </div>
        )}
      </Card>

      <Card className="p-4 space-y-3">
        <h3 className="text-body font-sans font-semibold text-paper">Progress</h3>
        {hours > 0 && (
          <div>
            <div className="flex justify-between text-caption text-ash mb-1">
              <span>{worked}h / {hours}h</span>
              <span>{percent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-iron">
              <div
                className="h-full rounded-full bg-signal-blue transition-all"
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
          </div>
        )}
        <div>
          <p className="text-caption text-ash">Has Attachments</p>
          <p className="text-body text-paper">{conversation.hasAttachments ? "Yes" : "No"}</p>
        </div>
      </Card>
    </div>
  )
}
