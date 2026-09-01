"use client"

import { useCallback, useState } from "react"
import { Plus } from "lucide-react"
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
import { useSalesTeamsList, useDeleteSalesTeam } from "@src/application/crm/di/hooks"
import type { SalesTeam } from "@/src/domain/crm/sales-teams/sales-team.entity"

export function SalesTeamListPage() {
  const router = useRouter()
  const { tenantId } = useAuth()
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | undefined>(undefined)

  const queryResult = useSalesTeamsList({ tenantId: tenantId!, search, cursor })
  const { items, nextCursor, isLoading, isLoadingMore, isError, error, loadMore, reset } = usePaginatedList<SalesTeam>(queryResult, cursor, setCursor)

  const { mutate: deleteTeam } = useDeleteSalesTeam()

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    reset()
  }, [reset])

  const columns: ColumnDef<SalesTeam>[] = [
    { key: "name", header: "Name", render: (row) => <span className="font-medium text-paper">{row.name}</span> },
    {
      key: "monthlyTarget",
      header: "Monthly Target",
      render: (row) => row.monthlyTarget != null ? `$${row.monthlyTarget.toLocaleString()}` : "—",
    },
    { key: "createdAt", header: "Created", render: (row) => new Date(row.createdAt).toLocaleDateString() },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteId(row.id) }}>
          Delete
        </Button>
      ),
    },
  ]

  if (!tenantId) return <Skeleton className="h-96" />
  if (isError) return <ErrorState message={error?.message} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Sales Teams"
        description="Manage your sales teams"
        actions={
          <Button onClick={() => router.push("/sales-teams/new")}>
            <Plus className="h-4 w-4" />
            Add Team
          </Button>
        }
      />
      <SearchInput value={search} onChange={handleSearchChange} placeholder="Search teams..." />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : items.length > 0 ? (
        <DataTable
          columns={columns}
          data={items}
          nextCursor={nextCursor}
          onLoadMore={loadMore}
          loadingMore={isLoadingMore}
          onRowClick={(row) => router.push(`/sales-teams/${row.id}`)}
        />
      ) : (
        <EmptyState title="No sales teams found" description="Create your first sales team to get started" />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete sales team"
        message="Are you sure you want to delete this sales team?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteId && deleteTeam(deleteId, { onSuccess: () => setDeleteId(null) })}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
export default SalesTeamListPage
