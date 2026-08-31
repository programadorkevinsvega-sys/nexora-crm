"use client"

import { useCallback, useState } from "react"
import { DataTable, type ColumnDef } from "@/src/presentation/crm/components/common/DataTable"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { SearchInput } from "@/src/presentation/crm/components/common/SearchInput"
import { FilterBar } from "@/src/presentation/crm/components/common/FilterBar"
import { StatusBadge } from "@/src/presentation/crm/components/common/StatusBadge"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { useRouter } from "next/navigation"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { usePaginatedList } from "@/src/presentation/hooks/use-paginated-list"
import { useAffiliatesList } from "@src/application/crm/di/hooks"
import type { Affiliate } from "@/src/domain/crm/affiliates/affiliate.entity"

export function AffiliateListPage() {
  const router = useRouter()
  const { tenantId } = useAuth()
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [cursor, setCursor] = useState<string | undefined>(undefined)

  const queryResult = useAffiliatesList({ tenantId: tenantId!, search, cursor, ...filters })
  const { items, nextCursor, isLoading, isLoadingMore, isError, error, loadMore, reset } = usePaginatedList<Affiliate>(queryResult, cursor, setCursor)

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    reset()
  }, [reset])

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    reset()
  }, [reset])

  const columns: ColumnDef<Affiliate>[] = [
    { key: "referralCode", header: "Referral Code", render: (row) => <span className="font-medium text-paper">{row.referralCode}</span> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "createdAt", header: "Created", render: (row) => new Date(row.createdAt).toLocaleDateString() },
  ]

  if (!tenantId) return <Skeleton className="h-96" />
  if (isError) return <ErrorState message={error?.message} />

  return (
    <div className="space-y-4">
      <PageHeader title="Affiliates" description="Manage your affiliates" />
      <SearchInput value={search} onChange={handleSearchChange} placeholder="Search affiliates..." />
      <FilterBar
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
              { value: "BLOCKED", label: "Blocked" },
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
          onRowClick={(row) => router.push(`/crm/affiliates/${row.id}`)}
        />
      ) : (
        <EmptyState title="No affiliates found" />
      )}
    </div>
  )
}
export default AffiliateListPage
