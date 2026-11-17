"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { useRouter } from "next/navigation"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { usePipelinesList, useDeletePipeline } from "@src/application/crm/di/hooks"
import { CreatePipelineModal } from "@/src/presentation/crm/components/modules/pipelines/create-pipeline-modal"

export function PipelineListPage() {
  const router = useRouter()
  const { tenantId } = useAuth()
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, isError, error } = usePipelinesList({ tenantId: tenantId! })
  const pipelines = Array.isArray(data?.data) ? data.data : []

  const { mutate: deletePipeline } = useDeletePipeline()

  if (!tenantId) return <Skeleton className="h-96" />
  if (isError) return <ErrorState message={error?.message} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Pipelines"
        description="Manage your sales pipelines"
        actions={
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            Add Pipeline
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : pipelines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipelines.map((pipeline: any) => (
            <Card key={pipeline.id} className="p-4 cursor-pointer hover:bg-steel/50 transition-colors" onClick={() => router.push(`/pipelines/${pipeline.id}/board`)}>
              <h3 className="text-body font-sans font-semibold text-paper">{pipeline.name}</h3>
              <p className="text-caption text-ash mt-1">{pipeline.description ?? "No description"}</p>
              <p className="text-caption text-ash mt-2">{pipeline.stages?.length ?? 0} stages</p>
              <div className="flex gap-2 mt-3">
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/pipelines/${pipeline.id}/board`) }}>
                  View Board
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteId(pipeline.id) }}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No pipelines found" description="Create your first pipeline to get started" />
      )}

      {showCreateModal && (
        <CreatePipelineModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            queryClient.invalidateQueries({ queryKey: ["pipelines"] })
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete pipeline"
        message="Are you sure you want to delete this pipeline?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { if (deleteId) deletePipeline(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
export default PipelineListPage
