"use client"

import { useState, type ReactNode, type DragEvent } from "react"
import { cn } from "@/src/shared/utils/cn"

export interface KanbanStage {
  id: string
  name: string
  deals: KanbanDeal[]
}

export interface KanbanDeal {
  id: string
  name: string
  amount?: number
  status?: string
}

export interface KanbanBoardProps {
  stages: KanbanStage[]
  onDragEnd: (dealId: string, newStageId: string) => void
  onDealClick?: (dealId: string) => void
  renderCard?: (deal: KanbanDeal) => ReactNode
  className?: string
}

function KanbanBoard({
  stages,
  onDragEnd,
  onDealClick,
  renderCard,
  className,
}: KanbanBoardProps) {
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)

  const handleDragStart = (e: DragEvent, dealId: string) => {
    e.dataTransfer.setData("dealId", dealId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: DragEvent, stageId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverStage(stageId)
  }

  const handleDragLeave = () => {
    setDragOverStage(null)
  }

  const handleDrop = (e: DragEvent, stageId: string) => {
    e.preventDefault()
    setDragOverStage(null)
    const dealId = e.dataTransfer.getData("dealId")
    if (dealId) {
      onDragEnd(dealId, stageId)
    }
  }

  return (
    <div className={cn("flex gap-4 overflow-x-auto pb-4", className)}>
      {stages.map((stage) => (
        <div
          key={stage.id}
          onDragOver={(e) => handleDragOver(e, stage.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, stage.id)}
          className={cn(
            "flex w-72 shrink-0 flex-col rounded-[var(--radius-cards)] bg-graphite rekki-inset",
            dragOverStage === stage.id && "ring-2 ring-signal-blue",
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-steel">
            <h3 className="text-body font-sans font-semibold text-paper">
              {stage.name}
            </h3>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-iron text-caption text-ash">
              {stage.deals.length}
            </span>
          </div>
          <div className="flex-1 space-y-3 p-3 overflow-y-auto">
            {stage.deals.length === 0 ? (
              <p className="text-caption text-ash text-center py-4">
                No deals
              </p>
            ) : (
              stage.deals.map((deal) =>
                renderCard ? (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                    onClick={() => onDealClick?.(deal.id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    {renderCard(deal)}
                  </div>
                ) : (
                  <KanbanCardView
                    key={deal.id}
                    deal={deal}
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                    onClick={() => onDealClick?.(deal.id)}
                  />
                ),
              )
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

interface KanbanCardViewProps {
  deal: KanbanDeal
  onDragStart: (e: DragEvent) => void
  onClick?: () => void
}

function KanbanCardView({ deal, onDragStart, onClick }: KanbanCardViewProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="rounded-[var(--radius-cards)] bg-iron p-3 rekki-inset cursor-grab active:cursor-grabbing hover:bg-steel transition-colors"
    >
      <p className="text-body font-sans font-medium text-paper truncate">
        {deal.name}
      </p>
      {deal.amount !== undefined && (
        <p className="text-caption text-ash mt-1">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(deal.amount)}
        </p>
      )}
    </div>
  )
}

export { KanbanBoard }
