"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { Pencil, Trash2, Trophy, XCircle, TrendingUp, DollarSign, Calendar, AlertCircle } from "lucide-react"
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
  const params = useParams()
  const router = useRouter()
  const [showDelete, setShowDelete] = useState(false)
  const id = params.id as string

  const { data: deal, isLoading, isError, error } = useDeal(id)
  const { mutate: deleteDeal } = useDeleteDeal()
  const { mutate: winDeal } = useWinDeal()
  const { mutate: loseDeal } = useLoseDeal()

  if (isError) return <ErrorState message={error?.message} />
  if (isLoading) return <Skeleton className="h-96" />
  if (!deal) return <div className="text-body text-ash">Oportunidad no encontrada</div>

  const forecastCategoryBadges: Record<string, string> = {
    CLOSED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    COMMIT: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    BEST_CASE: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    PIPELINE: "bg-slate-800 text-slate-300 border-slate-700",
  }

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
                <Button variant="outline" onClick={() => loseDeal({ id, reason: "Precio / Competencia" } as any)} className="gap-1.5 text-xs text-rose-400 border-rose-800/40 hover:bg-rose-950/30">
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
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: (deal as any).currency || "USD" }).format(deal.amount || (deal as any).value || 0)}
                </p>
              </div>
              <div>
                <p className="text-caption text-muted-foreground">Estado Comercial</p>
                <StatusBadge status={deal.status} />
              </div>
              <div>
                <p className="text-caption text-muted-foreground">Categoría de Forecasting</p>
                <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-md border mt-1 ${forecastCategoryBadges[(deal as any).forecastCategory ?? "PIPELINE"]}`}>
                  {(deal as any).forecastCategory || "PIPELINE"}
                </span>
              </div>
              <div>
                <p className="text-caption text-muted-foreground">Probabilidad Ponderada</p>
                <p className="text-body font-semibold text-cyan-400">
                  {(deal as any).probabilityOverride ?? deal.probability ?? "—"}%
                </p>
              </div>
              <div>
                <p className="text-caption text-muted-foreground">Fecha Estimada de Cierre</p>
                <p className="text-body font-mono text-foreground">{deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : "—"}</p>
              </div>
              <div>
                <p className="text-caption text-muted-foreground">Fecha de Cierre Real</p>
                <p className="text-body font-mono text-foreground">{(deal as any).actualCloseDate ? new Date((deal as any).actualCloseDate).toLocaleDateString() : "En Negociación"}</p>
              </div>
              {(deal as any).lossReason && (
                <div className="col-span-2 p-3 rounded-lg bg-rose-950/20 border border-rose-800/40 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <p className="text-xs text-rose-300"><span className="font-semibold">Motivo de Pérdida: </span>{(deal as any).lossReason}</p>
                </div>
              )}
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
