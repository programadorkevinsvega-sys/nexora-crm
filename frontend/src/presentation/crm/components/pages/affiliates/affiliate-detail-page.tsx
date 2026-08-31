"use client"

import { useParams } from "next/navigation"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Tabs } from "@/src/presentation/crm/components/ui/Tabs"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { EntityCard } from "@/src/presentation/crm/components/common/EntityCard"
import { StatusBadge } from "@/src/presentation/crm/components/common/StatusBadge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { CommissionTable } from "@/src/presentation/crm/components/modules/affiliates/commission-table"
import { PayoutTable } from "@/src/presentation/crm/components/modules/affiliates/payout-table"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useState } from "react"
import { useAffiliate } from "@src/application/crm/di/hooks"

export function AffiliateDetailPage() {
  const params = useParams()
  const { tenantId } = useAuth()
  const [activeTab, setActiveTab] = useState("details")
  const id = params.id as string

  const { data: affiliate, isLoading, isError, error } = useAffiliate(id)

  if (isError) return <ErrorState message={error?.message} />
  if (isLoading) return <Skeleton className="h-96" />
  if (!affiliate) return <div className="text-body text-ash">Affiliate not found</div>

  return (
    <div className="space-y-6">
      <PageHeader
        title={affiliate.referralCode}
        breadcrumb={[
          { label: "Affiliates", href: "/crm/affiliates" },
          { label: affiliate.referralCode },
        ]}
      />

      <Tabs
        tabs={[
          { id: "details", label: "Details" },
          { id: "commissions", label: "Commissions" },
          { id: "payouts", label: "Payouts" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "details" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <EntityCard title="Affiliate Information">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-caption text-ash">Referral Code</p>
                  <p className="text-body text-paper">{affiliate.referralCode}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Status</p>
                  <StatusBadge status={affiliate.status} />
                </div>
              </div>
            </EntityCard>
          </div>
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-body font-sans font-semibold text-paper mb-2">Metadata</h3>
              <div className="space-y-2 text-caption text-ash">
                <p>Created: {new Date(affiliate.createdAt).toLocaleDateString()}</p>
                <p>Updated: {new Date(affiliate.updatedAt).toLocaleDateString()}</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "commissions" && <CommissionTable affiliateId={id} />}
      {activeTab === "payouts" && <PayoutTable affiliateId={id} />}
    </div>
  )
}
export default AffiliateDetailPage
