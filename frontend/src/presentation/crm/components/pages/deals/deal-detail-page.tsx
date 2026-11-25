"use client"

import { useParams, useRouter } from "next/navigation"
import { Trash2, Trophy, XCircle, AlertCircle } from "lucide-react"
import { useState } from "react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { EntityCard } from "@/src/presentation/crm/components/common/EntityCard"
import { StatusBadge } from "@/src/presentation/crm/components/common/StatusBadge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useDeal, useDeleteDeal, useWinDeal, useLoseDeal } from "@src/application/crm/di/hooks"

export function DealDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [showDelete, setShowDelete] = useState(false)
  const id = params.id

  const { data: deal, isLoading, isError, error } = useDeal(id)
  const { mutate: deleteDeal } = useDeleteDeal()
  const { mutate: winDeal } = useWinDeal()
  const { mutate: loseDeal } = useLoseDeal()

  if (isError) return <ErrorState message={error?.message} />
  if (isLoading) return <Skeleton className="h-96" />
  if (!deal) return <div className="text-body text-ash">Oportunidad no encontrada</div>



  return (
    <div className="space-y-6">
      <PageHeader
        title={deal.name}
        breadcrumb={[{ label: "Pipelines & Deals", href: "/pipelines" }, { label: deal.name }]}
        actions={
          <div className="flex items-center gap-2">
            {deal.status === "OPEN" && (
              <>
                <Button onClick={() => winDeal(id)} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 text-xs">
                  <Trophy className="h-4 w-4" /> Marcar Ganada (Won)
                </Button>
                <Button variant="outline" onClick={() => loseDeal({ id, reason: "Precio / Competencia" })} className="gap-1.5 text-xs text-rose-400 border-rose-800/40 hover:bg-rose-950/30">
                  <XCircle className="h-4 w-4" /> Marcar Perdida (Lost)
                </Button>
              </>
            )}
            <Button variant="danger" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-4 w-4 mr-1" /> Eliminar
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <EntityCard title="Detalles de la Oportunidad Comercial">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-caption text-muted-foreground">Monto de Negociación</p>
                <p className="text-xl font-bold font-mono text-emerald-400">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: deal.currency || "USD" }).format(deal.value ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-caption text-muted-foreground">Estado Comercial</p>
                <StatusBadge status={deal.status} />
              </div>
              <div>
                <p className="text-caption text-muted-foreground">Probabilidad Ponderada</p>
                <p className="text-body font-semibold text-cyan-400">
                  {deal.probability ?? "—"}%
                </p>
              </div>
              <div>
                <p className="text-caption text-muted-foreground">Fecha Estimada de Cierre</p>
                <p className="text-body font-mono text-foreground">{deal.closeDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : "—"}</p>
              </div>


            </div>
          </EntityCard>
        </div>

        <div className="space-y-6">
          <Card className="p-4 bg-card border border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Metadatos de la Oportunidad</h3>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Fecha Creación: {new Date(deal.createdAt).toLocaleDateString()}</p>
              <p>Última Actualización: {new Date(deal.updatedAt).toLocaleDateString()}</p>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Eliminar oportunidad"
        message={`¿Estás seguro de eliminar el deal "${deal.name}"?`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={() => { deleteDeal(id); router.push("/pipelines") }}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
export default DealDetailPage
