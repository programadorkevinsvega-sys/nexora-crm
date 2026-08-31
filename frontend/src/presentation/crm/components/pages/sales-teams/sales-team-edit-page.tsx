"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Input } from "@/src/presentation/crm/components/ui/Input"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useSalesTeam, useUpdateSalesTeam } from "@src/application/crm/di/hooks"

export function EditSalesTeamPage() {
  const params = useParams()
  const router = useRouter()
  const { tenantId } = useAuth()
  const id = params.id as string

  const { data: team, isLoading, isError, error } = useSalesTeam(id)

  const [name, setName] = useState("")
  const [monthlyTarget, setMonthlyTarget] = useState("")

  useEffect(() => {
    if (team) {
      setName(team.name)
      setMonthlyTarget(team.monthlyTarget != null ? String(team.monthlyTarget) : "")
    }
  }, [team])

  const { mutate: updateTeam, isPending } = useUpdateSalesTeam()

  if (isError) return <ErrorState message={error?.message} />
  if (isLoading) return <Skeleton className="h-96" />
  if (!team) return <div className="text-body text-ash">Sales team not found</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Edit Sales Team"
        breadcrumb={[
          { label: "Sales Teams", href: "/crm/sales-teams" },
          { label: team.name, href: `/crm/sales-teams/${id}` },
          { label: "Edit" },
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
          <Button onClick={() => updateTeam(
                { id, data: { name, monthlyTarget: monthlyTarget ? Number(monthlyTarget) : null } },
                { onSuccess: () => router.push(`/crm/sales-teams/${id}`) }
              )} disabled={!name || isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
export default EditSalesTeamPage
