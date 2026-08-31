"use client"

import { useParams, useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Tabs } from "@/src/presentation/crm/components/ui/Tabs"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { EntityCard } from "@/src/presentation/crm/components/common/EntityCard"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { TeamQuotaTable } from "@/src/presentation/crm/components/modules/sales-teams/team-quota-table"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useSalesTeam, useDeleteSalesTeam } from "@src/application/crm/di/hooks"

export function SalesTeamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { tenantId } = useAuth()
  const [showDelete, setShowDelete] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const id = params.id as string

  const { data: team, isLoading, isError, error } = useSalesTeam(id)

  const { mutate: deleteTeam } = useDeleteSalesTeam()

  if (isError) return <ErrorState message={error?.message} />
  if (isLoading) return <Skeleton className="h-96" />
  if (!team) return <div className="text-body text-ash">Sales team not found</div>

  return (
    <div className="space-y-6">
      <PageHeader
        title={team.name}
        breadcrumb={[
          { label: "Sales Teams", href: "/crm/sales-teams" },
          { label: team.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => router.push(`/crm/sales-teams/${id}/edit`)}>
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
          { id: "quotas", label: "Quotas" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "details" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <EntityCard title="Team Information">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-caption text-ash">Monthly Target</p>
                  <p className="text-body text-paper">{team.monthlyTarget != null ? `$${team.monthlyTarget.toLocaleString()}` : "—"}</p>
                </div>
              </div>
            </EntityCard>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-body font-sans font-semibold text-paper mb-2">Metadata</h3>
              <div className="space-y-2 text-caption text-ash">
                <p>Created: {new Date(team.createdAt).toLocaleDateString()}</p>
                <p>Updated: {new Date(team.updatedAt).toLocaleDateString()}</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "quotas" && <TeamQuotaTable teamId={id} />}

      <ConfirmDialog
        open={showDelete}
        title="Delete sales team"
        message={`Are you sure you want to delete "${team.name}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteTeam(id, { onSuccess: () => router.push("/crm/sales-teams") })}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
export default SalesTeamDetailPage
