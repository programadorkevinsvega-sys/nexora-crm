"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Input } from "@/src/presentation/crm/components/ui/Input"
import { Select } from "@/src/presentation/crm/components/ui/Select"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useCreateCampaign } from "@src/application/crm/di/hooks"
import type { CampaignCreateInput } from "@/src/domain/crm/campaigns/campaign.entity"

export function CreateCampaignPage() {
  const router = useRouter()
  const { tenantId } = useAuth()

  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [status, setStatus] = useState<CampaignCreateInput["status"]>("PLANNED")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [budgetedCost, setBudgetedCost] = useState("")
  const [expectedRevenue, setExpectedRevenue] = useState("")

  const { mutate: createCampaign, isPending: isCreating } = useCreateCampaign()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Create Campaign"
        breadcrumb={[
          { label: "Campaigns", href: "/crm/campaigns" },
          { label: "Create Campaign" },
        ]}
      />

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-caption text-ash font-medium">Campaign Name *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Campaign name" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-caption text-ash font-medium">Type</label>
            <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g., Email, Social" />
          </div>
          <div className="space-y-2">
            <label className="text-caption text-ash font-medium">Status</label>
            <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="PLANNED">Planned</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-caption text-ash font-medium">Start Date</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-caption text-ash font-medium">End Date</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-caption text-ash font-medium">Budget</label>
            <Input type="number" value={budgetedCost} onChange={(e) => setBudgetedCost(e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <label className="text-caption text-ash font-medium">Expected Revenue</label>
            <Input type="number" value={expectedRevenue} onChange={(e) => setExpectedRevenue(e.target.value)} placeholder="0.00" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={() => createCampaign(
              { tenantId: tenantId!, name, type: type || null, status, startDate: startDate || null, endDate: endDate || null, budgetedCost: budgetedCost ? Number(budgetedCost) : null, expectedRevenue: expectedRevenue ? Number(expectedRevenue) : null },
              { onSuccess: () => router.push("/crm/campaigns") }
            )} disabled={!name || isCreating}>
            {isCreating ? "Creating..." : "Create Campaign"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
export default CreateCampaignPage
