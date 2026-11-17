"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Input } from "@/src/presentation/crm/components/ui/Input"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useCreateSalesTeam } from "@src/application/crm/di/hooks"

export function CreateSalesTeamPage() {
  const router = useRouter()
  const { tenantId } = useAuth()

  const [name, setName] = useState("")
  const [monthlyTarget, setMonthlyTarget] = useState("")

  const { mutate: createTeam, isPending } = useCreateSalesTeam()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Create Sales Team"
        breadcrumb={[
          { label: "Sales Teams", href: "/sales-teams" },
          { label: "Create Team" },
        ]}
      />

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-caption text-ash font-medium">Team Name *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Team name" />
        </div>

        <div className="space-y-2">
          <label className="text-caption text-ash font-medium">Monthly Target ($)</label>
          <Input type="number" value={monthlyTarget} onChange={(e) => setMonthlyTarget(e.target.value)} placeholder="0.00" />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={() => createTeam(
                { tenantId: tenantId!, name, monthlyTarget: monthlyTarget ? Number(monthlyTarget) : null },
                { onSuccess: () => router.push("/sales-teams") }
              )} disabled={!name || isPending}>
            {isPending ? "Creating..." : "Create Team"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
export default CreateSalesTeamPage
