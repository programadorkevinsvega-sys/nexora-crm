"use client"

import { useCallback, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { DataTable, type ColumnDef } from "@/src/presentation/crm/components/common/DataTable"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { StatusBadge } from "@/src/presentation/crm/components/common/StatusBadge"
import { useRouter } from "next/navigation"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { usePaginatedList } from "@/src/presentation/hooks/use-paginated-list"
import { useProgramsList, useDeleteProgram } from "@src/application/crm/di/hooks"
import type { AffiliateProgram } from "@/src/infrastructure/crm/repositories/affiliates/api-affiliate.repository"

export function ProgramListPage() {
  const router = useRouter()
  const { tenantId } = useAuth()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | undefined>(undefined)

  const queryResult = useProgramsList({ tenantId: tenantId!, cursor })
  const { items, nextCursor, isLoading, isLoadingMore, isError, error, loadMore } = usePaginatedList<AffiliateProgram>(queryResult, cursor, setCursor)

  const deleteMutation = useDeleteProgram()

  const columns: ColumnDef<AffiliateProgram>[] = [
    { key: "name", header: "Name", render: (row) => <span className="font-medium text-paper">{row.name}</span> },
    { key: "commissionType", header: "Commission Type" },
    { key: "commissionRate", header: "Rate", render: (row) => `${row.commissionRate}%` },
    { key: "cookieDays", header: "Cookie Days", render: (row) => `${row.cookieDays}d` },
    { key: "isActive", header: "Status", render: (row) => <StatusBadge status={row.isActive ? "active" : "disabled"} /> },
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
        title="Affiliate Programs"
        description="Manage your affiliate programs"
        actions={
          <Button onClick={() => router.push("/crm/affiliates/programs/new")}>
            <Plus className="h-4 w-4" />
            Add Program
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : items.length > 0 ? (
        <DataTable
          columns={columns}
          data={items}
          nextCursor={nextCursor}
          onLoadMore={loadMore}
          loadingMore={isLoadingMore}
          onRowClick={(row) => router.push(`/crm/affiliates/programs/${row.id}`)}
        />
      ) : (
        <EmptyState title="No affiliate programs found" description="Create your first program to get started" />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete program"
        message="Are you sure you want to delete this affiliate program?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
export default ProgramListPage
