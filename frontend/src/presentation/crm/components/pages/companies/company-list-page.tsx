"use client"

import { useCallback, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, GitFork } from "lucide-react"

import { Button } from "@/src/presentation/crm/components/ui/Button"
import { DataTable, type ColumnDef } from "@/src/presentation/crm/components/common/DataTable"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { SearchInput } from "@/src/presentation/crm/components/common/SearchInput"
import { StatusBadge } from "@/src/presentation/crm/components/common/StatusBadge"
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
    { key: "name", header: "Empresa", render: (row) => <span className="font-semibold text-zinc-100">{row.name}</span> },
    { key: "taxId", header: "Tax ID / NIT", render: (row) => <span>{row.taxId || "—"}</span> },
    { key: "industry", header: "Industria", render: (row) => <span>{row.industry || "General"}</span> },
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
    { key: "createdAt", header: "Fecha Creación", render: (row) => new Date(row.createdAt).toLocaleDateString() },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteId(row.id) }}>
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
        description="Gestión de empresas B2B, organigramas interactivos y empleados asociados."
        actions={
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Nueva Empresa
          </Button>
        }
      />
      <SearchInput value={search} onChange={handleSearchChange} placeholder="Buscar empresas..." />

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
        <EmptyState title="No companies found" />
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
        title="Delete company"
        message="Are you sure you want to delete this company?"
        confirmLabel="Delete"
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
