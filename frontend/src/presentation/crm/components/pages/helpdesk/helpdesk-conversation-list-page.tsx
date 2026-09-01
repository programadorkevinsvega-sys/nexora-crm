"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { DataTable, type ColumnDef } from "@/src/presentation/crm/components/common/DataTable"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { SearchInput } from "@/src/presentation/crm/components/common/SearchInput"
import { FilterBar } from "@/src/presentation/crm/components/common/FilterBar"
import { StatusBadge } from "@/src/presentation/crm/components/common/StatusBadge"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { usePaginatedList } from "@/src/presentation/hooks/use-paginated-list"
import { useConversationsList } from "@src/application/crm/di/hooks"
import type { Conversation } from "@/src/domain/crm/helpdesk/conversation.entity"

export function ConversationListPage() {
  const router = useRouter()
  const { tenantId } = useAuth()
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [cursor, setCursor] = useState<string | undefined>(undefined)

  const queryResult = useConversationsList({ tenantId: tenantId!, search, cursor, ...filters })
  const { items, nextCursor, isLoading, isLoadingMore, isError, error, loadMore, reset } = usePaginatedList<Conversation>(queryResult, cursor, setCursor)

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    reset()
  }, [reset])

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    reset()
  }, [reset])

  const priorityColors: Record<string, BadgeVariant> = {
    LOW: "default",
    MEDIUM: "info",
    HIGH: "warning",
    CRITICAL: "danger",
  }

  type BadgeVariant = "default" | "success" | "warning" | "danger" | "info"

  const columns: ColumnDef<Conversation>[] = [
    {
      key: "subject",
      header: "Subject",
      render: (row) => <span className="font-medium text-paper">{row.subject}</span>,
    },
    { key: "customerEmail", header: "Customer" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "priority",
      header: "Priority",
      render: (row) => <Badge variant={priorityColors[row.priority] ?? "default"} size="sm">{row.priority}</Badge>,
    },
    { key: "createdAt", header: "Created", render: (row) => new Date(row.createdAt).toLocaleDateString() },
  ]

  if (!tenantId) return <Skeleton className="h-96" />
  if (isError) return <ErrorState message={error?.message} />

  return (
    <div className="space-y-4">
      <PageHeader title="Conversations" description="Helpdesk conversations" />
      <SearchInput value={search} onChange={handleSearchChange} placeholder="Search conversations..." />
      <FilterBar
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "OPEN", label: "Open" },
              { value: "PENDING", label: "Pending" },
              { value: "WAITING_CUSTOMER", label: "Waiting Customer" },
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
          onRowClick={(row) => router.push(`/support/helpdesk/conversations/${row.id}`)}
        />
      ) : (
        <EmptyState title="No conversations found" />
      )}
    </div>
  )
}
export default ConversationListPage
