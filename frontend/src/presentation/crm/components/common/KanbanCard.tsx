"use client"

import { cn } from "@/src/shared/utils/cn"

export interface KanbanDealData {
  id: string
  name: string
  amount?: number
  status?: string
}

export interface KanbanCardProps {
  deal: KanbanDealData
  onClick?: () => void
  className?: string
}

function KanbanCard({ deal, onClick, className }: KanbanCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-[var(--radius-cards)] bg-iron p-3 rekki-inset cursor-pointer hover:bg-steel transition-colors",
        className,
      )}
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

export { KanbanCard }
