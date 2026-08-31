"use client"

import { useParams, useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Tabs } from "@/src/presentation/crm/components/ui/Tabs"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { EntityCard } from "@/src/presentation/crm/components/common/EntityCard"
import { StatusBadge } from "@/src/presentation/crm/components/common/StatusBadge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { CampaignMemberList } from "@/src/presentation/crm/components/modules/campaigns/campaign-member-list"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useCampaign, useDeleteCampaign } from "@src/application/crm/di/hooks"

export function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { tenantId } = useAuth()
  const [showDelete, setShowDelete] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const id = params.id as string

  const { data: campaign, isLoading, isError, error } = useCampaign(id)

  const { mutate: deleteCampaign } = useDeleteCampaign()

  if (isError) return <ErrorState message={error?.message} />
  if (isLoading) return <Skeleton className="h-96" />
  if (!campaign) return <div className="text-body text-ash">Campaign not found</div>

  return (
    <div className="space-y-6">
      <PageHeader
        title={campaign.name}
        breadcrumb={[
          { label: "Campaigns", href: "/crm/campaigns" },
          { label: campaign.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => router.push(`/crm/campaigns/${id}/edit`)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="danger" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <Tabs
        tabs={[
          { id: "details", label: "Details" },
          { id: "members", label: "Members" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "details" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <EntityCard title="Campaign Information">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-caption text-ash">Type</p>
                  <p className="text-body text-paper">{campaign.type ?? "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Status</p>
                  <StatusBadge status={campaign.status} />
                </div>
                <div>
                  <p className="text-caption text-ash">Budget</p>
                  <p className="text-body text-paper">{campaign.budgetedCost != null ? `$${campaign.budgetedCost.toLocaleString()}` : "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Actual Cost</p>
                  <p className="text-body text-paper">{campaign.actualCost != null ? `$${campaign.actualCost.toLocaleString()}` : "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Expected Revenue</p>
                  <p className="text-body text-paper">{campaign.expectedRevenue != null ? `$${campaign.expectedRevenue.toLocaleString()}` : "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Start Date</p>
                  <p className="text-body text-paper">{campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : "—"}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">End Date</p>
                  <p className="text-body text-paper">{campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : "—"}</p>
                </div>
              </div>
            </EntityCard>
          </div>
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-body font-sans font-semibold text-paper mb-2">Metadata</h3>
              <div className="space-y-2 text-caption text-ash">
                <p>Created: {new Date(campaign.createdAt).toLocaleDateString()}</p>
                <p>Updated: {new Date(campaign.updatedAt).toLocaleDateString()}</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "members" && (
        <CampaignMemberList campaignId={id} />
      )}

      <ConfirmDialog
        open={showDelete}
        title="Delete campaign"
        message={`Are you sure you want to delete "${campaign.name}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { deleteCampaign(id); router.push("/crm/campaigns") }}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
export default CampaignDetailPage
