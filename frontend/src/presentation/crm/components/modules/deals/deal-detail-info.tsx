"use client"

import { Card } from "@/src/presentation/crm/components/ui/Card"
import { StatusBadge } from "@/src/presentation/crm/components/common/StatusBadge"
import type { Deal } from "@/src/infrastructure/crm/repositories/deals/api-deal.repository"

export interface DealDetailInfoProps {
  deal: Deal
}

export function DealDetailInfo({ deal }: DealDetailInfoProps) {
  return (
    <Card className="p-4">
      <h3 className="text-body font-sans font-semibold text-paper mb-4">Deal Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-caption text-ash">Name</p>
          <p className="text-body text-paper font-medium">{deal.name}</p>
        </div>
        <div>
          <p className="text-caption text-ash">Status</p>
          <StatusBadge status={deal.status} />
        </div>
        <div>
          <p className="text-caption text-ash">Value</p>
          <p className="text-body text-paper">
            {deal.value != null
              ? new Intl.NumberFormat("en-US", { style: "currency", currency: deal.currency ?? "USD" }).format(deal.value)
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-caption text-ash">Probability</p>
          <p className="text-body text-paper">{deal.probability != null ? `${deal.probability}%` : "—"}</p>
        </div>
        <div>
          <p className="text-caption text-ash">Close Date</p>
          <p className="text-body text-paper">{deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : "—"}</p>
        </div>
      </div>
    </Card>
  )
}
