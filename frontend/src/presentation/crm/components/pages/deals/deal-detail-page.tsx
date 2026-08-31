"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Pencil, Trash2, Trophy, XCircle } from "lucide-react"
import { useState } from "react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { EntityCard } from "@/src/presentation/crm/components/common/EntityCard"
import { StatusBadge } from "@/src/presentation/crm/components/common/StatusBadge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useDeal, useDeleteDeal, useWinDeal, useLoseDeal } from "@src/application/crm/di/hooks"

export function DealDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { tenantId } = useAuth()
  const queryClient = useQueryClient()
  const [showDelete, setShowDelete] = useState(false)
  const id = params.id as string

  const { data: deal, isLoading, isError, error } = useDeal(id)

  const { mutate: deleteDeal } = useDeleteDeal()
  const { mutate: winDeal } = useWinDeal()
  const { mutate: loseDeal } = useLoseDeal()

  if (isError) return <ErrorState message={error?.message} />
  if (isLoading) return <Skeleton className="h-96" />
  if (!deal) return <div className="text-body text-ash">Deal not found</div>

  return (
    <div className="space-y-6">
      <PageHeader
        title={deal.name}
        breadcrumb={[
          { label: "Pipelines", href: "/crm/pipelines" },
          { label: deal.name },
        ]}
        actions={
          <div className="flex gap-2">
            {deal.status === "OPEN" && (
              <>
                <Button variant="ghost" onClick={() => winDeal(id)}>
                  <Trophy className="h-4 w-4" />
                  Won
                </Button>
                <Button variant="ghost" onClick={() => loseDeal({ id })}>
                  <XCircle className="h-4 w-4" />
                  Lost
                </Button>
              </>
            )}
            <Button variant="danger" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <EntityCard title="Deal Information">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-caption text-ash">Value</p>
                <p className="text-body text-paper font-semibold">
                  {deal.value != null
                    ? new Intl.NumberFormat("en-US", { style: "currency", currency: deal.currency ?? "USD" }).format(deal.value)
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-caption text-ash">Status</p>
                <StatusBadge status={deal.status} />
              </div>
              <div>
                <p className="text-caption text-ash">Probability</p>
                <p className="text-body text-paper">{deal.probability != null ? `${deal.probability}%` : "—"}</p>
              </div>
              <div>
                <p className="text-caption text-ash">Close Date</p>
                <p className="text-body text-paper">{deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : "—"}</p>
              </div>
            </div>
          </EntityCard>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-body font-sans font-semibold text-paper mb-2">Metadata</h3>
            <div className="space-y-2 text-caption text-ash">
              <p>Created: {new Date(deal.createdAt).toLocaleDateString()}</p>
              <p>Updated: {new Date(deal.updatedAt).toLocaleDateString()}</p>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete deal"
        message={`Are you sure you want to delete "${deal.name}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { deleteDeal(id); router.push("/crm/pipelines") }}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
export default DealDetailPage
