"use client"

import { useQuery } from "@tanstack/react-query"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { ApiLoyaltyRepository } from "@/src/infrastructure/crm/repositories/loyalty/api-loyalty.repository"

export interface LoyaltyProfileCardProps {
  contactId: string
}

export function LoyaltyProfileCard({ contactId }: LoyaltyProfileCardProps) {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["loyalty-profile", contactId],
    queryFn: () => ApiLoyaltyRepository.getProfile(contactId),
    enabled: !!contactId,
  })

  if (isLoading) return <Skeleton className="h-32" />
  if (!profile) return null

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-body font-sans font-semibold text-paper">Loyalty Profile</h3>
        <Badge variant={profile.tierLevel === "GOLD" ? "warning" : profile.tierLevel === "SILVER" ? "info" : "default"}>
          {profile.tierLevel}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-caption text-ash">Points Balance</p>
          <p className="text-body text-paper font-semibold">{profile.loyaltyPointsBalance}</p>
        </div>
        <div>
          <p className="text-caption text-ash">Lifetime Value</p>
          <p className="text-body text-paper">${profile.totalLifetimeValue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-caption text-ash">Purchases</p>
          <p className="text-body text-paper">{profile.totalPurchasesCount}</p>
        </div>
        <div>
          <p className="text-caption text-ash">Avg Order</p>
          <p className="text-body text-paper">${profile.averageOrderValue.toLocaleString()}</p>
        </div>
      </div>
    </Card>
  )
}
