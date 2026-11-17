"use client"

import { useCallback, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, GitFork, Building2, ShieldCheck, HeartPulse } from "lucide-react"

import { Button } from "@/src/presentation/crm/components/ui/Button"
import { DataTable, type ColumnDef } from "@/src/presentation/crm/components/common/DataTable"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { SearchInput } from "@/src/presentation/crm/components/common/SearchInput"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { useRouter } from "next/navigation"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { usePaginatedList } from "@/src/presentation/hooks/use-paginated-list"
import { useCompaniesList, useDeleteCompany } from "@src/application/crm/di/hooks"
import { CreateCompanyModal } from "@/src/presentation/crm/components/modules/companies/create-company-modal"
import type { Company } from "@/src/domain/crm/companies/company.entity"

export function CompanyListPage() {
  const router = useRouter()
  const { tenantId } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | undefined>(undefined)

  const queryResult = useCompaniesList({ tenantId: tenantId!, search, cursor })
  const { items, nextCursor, isLoading, isLoadingMore, isError, error, loadMore, reset } = usePaginatedList<Company>(queryResult, cursor, setCursor)

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    reset()
  }, [reset])

  const { mutate: deleteCompany } = useDeleteCompany()

  const columns: ColumnDef<Company>[] = [
    {
      key: "name",
      header: "Empresa",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
            {row.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.website || row.email || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "taxId",
      header: "Tax ID / Ubicación",
      render: (row) => (
        <div className="text-xs">
          <p className="font-mono text-slate-300">{row.taxId || "Sin NIT"}</p>
          <p className="text-muted-foreground">{[row.city, row.country].filter(Boolean).join(", ") || "Global"}</p>
        </div>
      ),
    },
    {
      key: "tier",
      header: "Tier & Etapa",
      render: (row) => (
        <div className="flex flex-col gap-1 items-start">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            row.tier === "TIER_1_VIP" ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" : "bg-slate-800 text-slate-300"
          }`}>
            {row.tier || "TIER_2"}
          </span>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase">{row.lifecycleStage || "PROSPECT"}</span>
        </div>
      ),
    },
    {
      key: "healthScore",
      header: "Salud Cuenta",
      render: (row) => {
        const score = row.healthScore ?? 100
        const color = score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-rose-400"
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <HeartPulse className={`h-3.5 w-3.5 ${color}`} />
            <span className={color}>{score} / 100</span>
          </div>
        )
      },
    },
    {
      key: "orgChart",
      header: "Jerarquía",
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/companies/${row.id}`)
          }}
          className="gap-1.5 text-xs text-cyan-300 border-cyan-800/40 hover:bg-cyan-950/40 h-7"
        >
          <GitFork className="h-3.5 w-3.5" />
          <span>Organigrama</span>
        </Button>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <Button variant="ghost" size="sm" className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/20" onClick={(e) => { e.stopPropagation(); setDeleteId(row.id) }}>
          Eliminar
        </Button>
      ),
    },
  ]

  if (!tenantId) return <Skeleton className="h-96" />
  if (isError) return <ErrorState message={error?.message} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Empresas & Cuentas Corporativas"
        description="Gestión integral de empresas B2B, organigramas interactivos, tiers VIP y health scores."
        actions={
          <Button onClick={() => setShowCreateModal(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium">
            <Plus className="h-4 w-4 mr-1.5" />
            Nueva Empresa
          </Button>
        }
      />
      <SearchInput value={search} onChange={handleSearchChange} placeholder="Buscar por nombre, NIT o industria..." />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : items.length > 0 ? (
        <DataTable
          columns={columns}
          data={items}
          nextCursor={nextCursor}
          onLoadMore={loadMore}
          loadingMore={isLoadingMore}
          onRowClick={(row) => router.push(`/companies/${row.id}`)}
        />
      ) : (
        <EmptyState title="No se encontraron empresas registradas" />
      )}

      {showCreateModal && (
        <CreateCompanyModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            queryClient.invalidateQueries({ queryKey: ["companies"] })
          }}
        />
      )}
      <ConfirmDialog
        open={!!deleteId}
        title="Eliminar empresa"
        message="¿Estás seguro de que deseas eliminar esta cuenta corporativa? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={() => {
          if (deleteId) deleteCompany(deleteId)
          setDeleteId(null)
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
export default CompanyListPage
