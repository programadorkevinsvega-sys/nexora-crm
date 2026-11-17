"use client"

import { useParams, useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Tabs } from "@/src/presentation/crm/components/ui/Tabs"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { EntityCard } from "@/src/presentation/crm/components/common/EntityCard"
import { StatusBadge } from "@/src/presentation/crm/components/common/StatusBadge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { CommissionTable } from "@/src/presentation/crm/components/modules/affiliates/commission-table"
import { PayoutTable } from "@/src/presentation/crm/components/modules/affiliates/payout-table"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useProgram, useDeleteProgram } from "@src/application/crm/di/hooks"

export function ProgramDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { tenantId } = useAuth()
  const [showDelete, setShowDelete] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const id = params.id as string

  const { data: program, isLoading, isError, error } = useProgram(id)

  const deleteMutation = useDeleteProgram()

  if (isError) return <ErrorState message={error?.message} />
  if (isLoading) return <Skeleton className="h-96" />
  if (!program) return <div className="text-body text-ash">Program not found</div>

  return (
    <div className="space-y-6">
      <PageHeader
        title={program.name}
        breadcrumb={[
          { label: "Programs", href: "/affiliates/programs" },
          { label: program.name },
        ]}
        actions={
          <Button variant="danger" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        }
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
            <EntityCard title="Program Information">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-caption text-ash">Commission Type</p>
                  <p className="text-body text-paper">{program.commissionType}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Commission Rate</p>
                  <p className="text-body text-paper">{program.commissionRate}%</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Cookie Days</p>
                  <p className="text-body text-paper">{program.cookieDays}</p>
                </div>
                <div>
                  <p className="text-caption text-ash">Status</p>
                  <StatusBadge status={program.isActive ? "active" : "disabled"} />
                </div>
              </div>
            </EntityCard>
          </div>
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-body font-sans font-semibold text-paper mb-2">Metadata</h3>
              <div className="space-y-2 text-caption text-ash">
                <p>Created: {new Date(program.createdAt).toLocaleDateString()}</p>
                <p>Updated: {new Date(program.updatedAt).toLocaleDateString()}</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "commissions" && <CommissionTable programId={id} />}
      {activeTab === "payouts" && <PayoutTable programId={id} />}

      <ConfirmDialog
        open={showDelete}
        title="Delete program"
        message={`Are you sure you want to delete "${program.name}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteMutation.mutate(id, { onSuccess: () => router.push("/affiliates/programs") })}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
export default ProgramDetailPage
