"use client"

import { useQuery } from "@tanstack/react-query"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ApiLoyaltyRepository } from "@/src/infrastructure/crm/repositories/loyalty/api-loyalty.repository"

export interface CustomerMetricsCardProps {
  contactId: string
}

export function CustomerMetricsCard({ contactId }: CustomerMetricsCardProps) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["customer-metrics", contactId],
    queryFn: () => ApiLoyaltyRepository.getMetrics(contactId),
    enabled: !!contactId,
  })

  if (isLoading) return <Skeleton className="h-24" />
  if (!metrics) return null

  const scoreColor = (score: number | null, threshold: number) => {
    if (score == null) return "text-ash"
    return score >= threshold ? "text-[#4ade80]" : "text-[#f87171]"
  }

  return (
    <Card className="p-4 space-y-3">
      <h3 className="text-body font-sans font-semibold text-paper">Customer Metrics</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-caption text-ash">Churn Risk</p>
          <p className={`text-body font-semibold ${scoreColor(metrics.churnRiskScore, 50)}`}>
            {metrics.churnRiskScore != null ? `${metrics.churnRiskScore}/100` : "—"}
          </p>
        </div>
        <div>
          <p className="text-caption text-ash">RFM Score</p>
          <p className="text-body font-semibold">{metrics.rfmScore != null ? metrics.rfmScore : "—"}</p>
        </div>
        <div>
          <p className="text-caption text-ash">NPS</p>
          <p className={`text-body font-semibold ${scoreColor(metrics.npsScore, 50)}`}>
            {metrics.npsScore != null ? metrics.npsScore : "—"}
          </p>
        </div>
        <div>
          <p className="text-caption text-ash">CSAT</p>
          <p className={`text-body font-semibold ${scoreColor(metrics.customerSatisfactionScore, 4)}`}>
            {metrics.customerSatisfactionScore != null ? `${metrics.customerSatisfactionScore}/5` : "—"}
          </p>
        </div>
      </div>
    </Card>
  )
}
