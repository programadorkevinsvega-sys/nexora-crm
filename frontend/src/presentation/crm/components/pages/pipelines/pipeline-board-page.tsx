"use client"

import { useParams, useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { KanbanBoard, type KanbanStage } from "@/src/presentation/crm/components/common/KanbanBoard"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { usePipelineBoard, useMoveDeal } from "@src/application/crm/di/hooks"
import { useState } from "react"
import { CreateDealModal } from "@/src/presentation/crm/components/modules/deals/create-deal-modal"
import type { PipelineBoard } from "@/src/domain/crm/pipelines/pipeline.entity"

export function PipelineBoardPage() {
  const params = useParams()
  const router = useRouter()
  const { tenantId } = useAuth()
  const [showCreateDeal, setShowCreateDeal] = useState(false)
  const pipelineId = params.id as string

  const { data: pipeline, isLoading, isError, error } = usePipelineBoard(pipelineId)

  const { mutate: moveDeal } = useMoveDeal()

  const stages: KanbanStage[] = (pipeline as any)?.stages?.map((stage: any) => ({
    id: stage.id,
    name: stage.name,
    deals: (stage.deals ?? []).map((deal: any) => ({
      id: deal.id,
      name: deal.name,
      amount: deal.value ? Number(deal.value) : undefined,
    })),
  })) ?? []

  if (isError) return <ErrorState message={error?.message} />
  if (isLoading) return <Skeleton className="h-96" />
  if (!pipeline) return <div className="text-body text-ash">Pipeline not found</div>

  return (
    <div className="space-y-4">
      <PageHeader
        title={pipeline.name}
        description={pipeline.description ?? "Pipeline board"}
        breadcrumb={[
          { label: "Pipelines", href: "/pipelines" },
          { label: pipeline.name },
        ]}
        actions={
          <Button onClick={() => setShowCreateDeal(true)}>
            <Plus className="h-4 w-4" />
            Add Deal
          </Button>
        }
      />

      <KanbanBoard
        stages={stages}
        onDragEnd={(dealId, newStageId) => moveDeal({ dealId, stageId: newStageId })}
        onDealClick={(dealId) => router.push(`/pipelines/deals/${dealId}`)}
      />

      {showCreateDeal && (
        <CreateDealModal
          pipelineId={pipelineId}
          stages={pipeline.stages ?? []}
          onClose={() => setShowCreateDeal(false)}
          onSuccess={() => setShowCreateDeal(false)}
        />
      )}
    </div>
  )
}
export default PipelineBoardPage
