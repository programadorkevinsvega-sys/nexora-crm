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
import { RenewContractAction } from "@/src/presentation/crm/components/modules/contracts/renew-contract-action"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useContract, useDeleteContract } from "@src/application/crm/di/hooks"

export function ContractDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { tenantId } = useAuth()
  const [showDelete, setShowDelete] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const id = params.id as string

  const { data: contract, isLoading, isError, error } = useContract(id)

  const deleteMutation = useDeleteContract()

  if (isError) return <ErrorState message={error?.message} />
  if (isLoading) return <Skeleton className="h-96" />
  if (!contract) return <div className="text-body text-ash">Contract not found</div>

  return (
    <div className="space-y-6">
      <PageHeader
        title={contract.name}
        breadcrumb={[
          { label: "Contracts", href: "/crm/contracts" },
          { label: contract.name },
        ]}
        actions={
          <div className="flex gap-2">
            <RenewContractAction contractId={id} status={contract.status} />
            <Button variant="ghost" onClick={() => router.push(`/crm/contracts/${id}/edit`)}>
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
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <EntityCard title="Contract Information">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-caption text-ash">Status</p>
                <StatusBadge status={contract.status} />
              </div>
              <div>
                <p className="text-caption text-ash">Auto Renew</p>
                <p className="text-body text-paper">{contract.autoRenew ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-caption text-ash">Start Date</p>
                <p className="text-body text-paper">{new Date(contract.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-caption text-ash">End Date</p>
                <p className="text-body text-paper">{contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "—"}</p>
              </div>
              <div>
                <p className="text-caption text-ash">MRR Value</p>
                <p className="text-body text-paper">{contract.mrrValue != null ? `$${contract.mrrValue.toLocaleString()}` : "—"}</p>
              </div>
            </div>
          </EntityCard>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-body font-sans font-semibold text-paper mb-2">Metadata</h3>
            <div className="space-y-2 text-caption text-ash">
              <p>Created: {new Date(contract.createdAt).toLocaleDateString()}</p>
              <p>Updated: {new Date(contract.updatedAt).toLocaleDateString()}</p>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete contract"
        message={`Are you sure you want to delete "${contract.name}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteMutation.mutate(id, { onSuccess: () => router.push("/crm/contracts") })}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
export default ContractDetailPage
