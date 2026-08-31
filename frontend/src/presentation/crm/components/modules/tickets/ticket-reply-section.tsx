"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { EntityCard } from "@/src/presentation/crm/components/common/EntityCard"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { ApiTicketReplyRepository } from "@/src/infrastructure/crm/repositories/tickets/api-ticket-reply.repository"

export interface TicketReplySectionProps {
  ticketId: string
}

export function TicketReplySection({ ticketId }: TicketReplySectionProps) {
  const { tenantId, userId } = useAuth()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState("")
  const [isInternal, setIsInternal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["ticket-replies", ticketId],
    queryFn: () => ApiTicketReplyRepository.listByTicketId(ticketId),
    enabled: !!ticketId,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      ApiTicketReplyRepository.create({
        tenantId: tenantId!,
        ticketId,
        authorType: "AGENT",
        authorId: userId!,
        message,
        isInternalNote: isInternal,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-replies", ticketId] })
      setMessage("")
      setIsInternal(false)
    },
  })

  if (isLoading) return <Skeleton className="h-48" />

  return (
    <div className="space-y-4">
      <EntityCard title="Replies">
        {data && data.data.length > 0 ? (
          <div className="space-y-3">
            {data.data.map((reply) => (
              <div key={reply.id} className="rounded-[var(--radius-cards)] bg-iron p-3 rekki-inset">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={reply.authorType === "AGENT" ? "info" : reply.authorType === "CUSTOMER" ? "success" : "default"} size="sm">
                    {reply.authorType}
                  </Badge>
                  {reply.isInternalNote && (
                    <Badge variant="warning" size="sm">Internal</Badge>
                  )}
                </div>
                <p className="text-body text-paper whitespace-pre-wrap">{reply.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-caption text-ash">No replies yet</p>
        )}
      </EntityCard>

      <Card className="p-4 space-y-3">
        <textarea
          className="h-24 w-full rounded-inputs bg-graphite px-3 py-2 text-sm text-foreground placeholder:text-ash rekki-inset focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your reply..."
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-caption text-ash cursor-pointer">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="rounded border-steel bg-graphite"
            />
            Internal note
          </label>
          <Button onClick={() => createMutation.mutate()} disabled={!message || createMutation.isPending}>
            {createMutation.isPending ? "Sending..." : "Send Reply"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
