"use client"

import { useCallback, useState } from "react"
import { Plus } from "lucide-react"
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
import { useCampaignsList, useDeleteCampaign } from "@src/application/crm/di/hooks"
import type { Campaign } from "@/src/domain/crm/campaigns/campaign.entity"

export function CampaignListPage() {
  const router = useRouter()
  const { tenantId } = useAuth()
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | undefined>(undefined)

  const queryResult = useCampaignsList({ tenantId: tenantId!, search, cursor })
  const { items, nextCursor, isLoading, isLoadingMore, isError, error, loadMore, reset } = usePaginatedList<Campaign>(queryResult, cursor, setCursor)

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    reset()
  }, [reset])

  const { mutate: deleteCampaign } = useDeleteCampaign()

  const columns: ColumnDef<Campaign>[] = [
    { key: "name", header: "Name", render: (row) => <span className="font-medium text-paper">{row.name}</span> },
    { key: "type", header: "Type" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "budgetedCost",
      header: "Budget",
      render: (row) => row.budgetedCost != null ? `$${row.budgetedCost.toLocaleString()}` : "—",
    },
    {
      key: "startDate",
      header: "Start Date",
      render: (row) => row.startDate ? new Date(row.startDate).toLocaleDateString() : "—",
    },
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
        title="Campaigns"
        description="Manage your marketing campaigns"
        actions={
          <Button onClick={() => router.push("/crm/campaigns/new")}>
            <Plus className="h-4 w-4" />
            Add Campaign
          </Button>
        }
      />
      <SearchInput value={search} onChange={handleSearchChange} placeholder="Search campaigns..." />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : items.length > 0 ? (
        <DataTable
          columns={columns}
          data={items}
          nextCursor={nextCursor}
          onLoadMore={loadMore}
          loadingMore={isLoadingMore}
          onRowClick={(row) => router.push(`/crm/campaigns/${row.id}`)}
        />
      ) : (
        <EmptyState title="No campaigns found" description="Create your first campaign to get started" />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete campaign"
        message="Are you sure you want to delete this campaign?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { if (deleteId) deleteCampaign(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
export default CampaignListPage
