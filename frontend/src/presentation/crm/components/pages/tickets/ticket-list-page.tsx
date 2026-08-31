"use client"

import { useCallback, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { DataTable, type ColumnDef } from "@/src/presentation/crm/components/common/DataTable"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { SearchInput } from "@/src/presentation/crm/components/common/SearchInput"
import { FilterBar } from "@/src/presentation/crm/components/common/FilterBar"
import { StatusBadge } from "@/src/presentation/crm/components/common/StatusBadge"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { useRouter } from "next/navigation"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { usePaginatedList } from "@/src/presentation/hooks/use-paginated-list"
import { useTicketsList, useDeleteTicket } from "@src/application/crm/di/hooks"
import type { Ticket } from "@/src/domain/crm/support-tickets/ticket.entity"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"

export function TicketListPage() {
  const router = useRouter()
  const { tenantId } = useAuth()
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | undefined>(undefined)

  const queryResult = useTicketsList({ tenantId: tenantId!, search, cursor, ...filters })
  const { items, nextCursor, isLoading, isLoadingMore, isError, error, loadMore, reset } = usePaginatedList<Ticket>(queryResult, cursor, setCursor)

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    reset()
  }, [reset])

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    reset()
  }, [reset])

  const { mutate: deleteTicket } = useDeleteTicket()

  const priorityColors: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
    LOW: "default",
    MEDIUM: "info",
    HIGH: "warning",
    CRITICAL: "danger",
  }

  const columns: ColumnDef<Ticket>[] = [
    { key: "subject", header: "Subject", render: (row) => <span className="font-medium text-paper">{row.subject}</span> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "priority",
      header: "Priority",
      render: (row) => <Badge variant={priorityColors[row.priority] ?? "default"} size="sm">{row.priority}</Badge>,
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
        title="Support Tickets"
        description="Manage support tickets"
        actions={
          <Button onClick={() => router.push("/tickets/new")}>
            <Plus className="h-4 w-4" />
            Add Ticket
          </Button>
        }
      />
      <SearchInput value={search} onChange={handleSearchChange} placeholder="Search tickets..." />
      <FilterBar
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "OPEN", label: "Open" },
              { value: "PENDING", label: "Pending" },
              { value: "RESOLVED", label: "Resolved" },
              { value: "CLOSED", label: "Closed" },
            ],
          },
          {
            key: "priority",
            label: "Priority",
            options: [
              { value: "LOW", label: "Low" },
              { value: "MEDIUM", label: "Medium" },
              { value: "HIGH", label: "High" },
              { value: "CRITICAL", label: "Critical" },
            ],
          },
        ]}
        values={filters}
        onChange={handleFilterChange}
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
          onRowClick={(row) => router.push(`/tickets/${row.id}`)}
        />
      ) : (
        <EmptyState title="No tickets found" description="Create your first ticket to get started" />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete ticket"
        message="Are you sure you want to delete this ticket?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteId && deleteTicket(deleteId, { onSuccess: () => setDeleteId(null) })}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
export default TicketListPage
