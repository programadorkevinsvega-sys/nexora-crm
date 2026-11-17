"use client"

import { useCallback, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { DataTable, type ColumnDef } from "@/src/presentation/crm/components/common/DataTable"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { StatusBadge } from "@/src/presentation/crm/components/common/StatusBadge"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { useRouter } from "next/navigation"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { usePaginatedList } from "@/src/presentation/hooks/use-paginated-list"
import { useQuotesList, useDeleteQuote } from "@src/application/crm/di/hooks"
import type { Quote } from "@/src/domain/crm/contracts/quote.entity"

export function QuoteListPage() {
  const router = useRouter()
  const { tenantId } = useAuth()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | undefined>(undefined)

  const queryResult = useQuotesList({ tenantId: tenantId!, cursor })
  const { items, nextCursor, isLoading, isLoadingMore, isError, error, loadMore } = usePaginatedList<Quote>(queryResult, cursor, setCursor)

  const { mutate: deleteMutation, isPending: isDeleting } = useDeleteQuote()

  const columns: ColumnDef<Quote>[] = [
    { key: "quoteNumber", header: "Number", render: (row) => <span className="font-medium text-paper">{row.quoteNumber}</span> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "grandTotal",
      header: "Total",
      render: (row) => row.grandTotal != null ? `$${row.grandTotal.toLocaleString()}` : "—",
    },
    { key: "validUntil", header: "Valid Until", render: (row) => new Date(row.validUntil).toLocaleDateString() },
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
        title="Quotes"
        description="Manage your quotes"
        actions={
          <Button onClick={() => router.push("/quotes/new")}>
            <Plus className="h-4 w-4" />
            Add Quote
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
          onRowClick={(row) => router.push(`/quotes/${row.id}`)}
        />
      ) : (
        <EmptyState title="No quotes found" description="Create your first quote to get started" />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete quote"
        message="Are you sure you want to delete this quote?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteId && deleteMutation(deleteId, { onSuccess: () => setDeleteId(null) })}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
export default QuoteListPage
