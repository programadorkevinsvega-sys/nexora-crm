"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { ApiHelpdeskRepository } from "@/src/infrastructure/crm/repositories/helpdesk/api-helpdesk.repository"

export interface ThreadTimelineProps {
  conversationId: string
}

export function ThreadTimeline({ conversationId }: ThreadTimelineProps) {
  const { tenantId, userId } = useAuth()
  const queryClient = useQueryClient()
  const [bodyText, setBodyText] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["helpdesk-threads", conversationId],
    queryFn: () => ApiHelpdeskRepository.listThreads(conversationId),
    enabled: !!conversationId,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      ApiHelpdeskRepository.createThread({
        tenantId: tenantId!,
        conversationId,
        threadType: "NOTE",
        bodyText: bodyText || null,
        createdByUserId: userId!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["helpdesk-threads", conversationId] })
      setBodyText("")
    },
  })

  if (isLoading) return <Skeleton className="h-48" />

  return (
    <div className="space-y-4">
      {data && data.data.length > 0 ? (
        <div className="space-y-3">
          {data.data.map((thread) => (
            <Card key={thread.id} className="p-3">
              <p className="text-body text-paper whitespace-pre-wrap">{thread.bodyText ?? thread.bodyHtml ?? "No content"}</p>
              <p className="text-caption text-ash mt-2">{new Date(thread.createdAt).toLocaleString()}</p>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No threads" description="No messages in this conversation yet" />
      )}

      <Card className="p-4 space-y-3">
        <textarea
          className="h-24 w-full rounded-inputs bg-graphite px-3 py-2 text-sm text-foreground placeholder:text-ash rekki-inset focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          placeholder="Add a note..."
        />
        <div className="flex justify-end">
          <Button onClick={() => createMutation.mutate()} disabled={!bodyText || createMutation.isPending}>
            {createMutation.isPending ? "Adding..." : "Add Note"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
