"use client"

import { useCallback, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
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
import { useContactsList, useDeleteContact } from "@src/application/crm/di/hooks"
import { CreateContactModal } from "@/src/presentation/crm/components/modules/contacts/create-contact-modal"
import type { Contact } from "@/src/domain/crm/contacts/contact.entity"

export function ContactListPage() {
  const router = useRouter()
  const { tenantId } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | undefined>(undefined)

  const queryResult = useContactsList({ tenantId: tenantId!, search, cursor })
  const { items, nextCursor, isLoading, isLoadingMore, isError, error, loadMore, reset } = usePaginatedList<Contact>(queryResult, cursor, setCursor)

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    reset()
  }, [reset])

  const { mutate: deleteContact } = useDeleteContact()

  const columns: ColumnDef<Contact>[] = [
    {
      key: "firstName",
      header: "Name",
      render: (row) => <span className="font-medium text-paper">{row.firstName} {row.lastName}</span>,
    },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "jobTitle", header: "Job Title" },
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
        title="Contacts"
        description="Manage your contacts"
        actions={
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        }
      />
      <SearchInput value={search} onChange={handleSearchChange} placeholder="Search contacts..." />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : items.length > 0 ? (
        <DataTable
          columns={columns}
          data={items}
          nextCursor={nextCursor}
          onLoadMore={loadMore}
          loadingMore={isLoadingMore}
          onRowClick={(row) => router.push(`/crm/contacts/${row.id}`)}
        />
      ) : (
        <EmptyState title="No contacts found" description="Create your first contact to get started" />
      )}

      {showCreateModal && (
        <CreateContactModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            queryClient.invalidateQueries({ queryKey: ["contacts"] })
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete contact"
        message="Are you sure you want to delete this contact?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { if (deleteId) deleteContact(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
export default ContactListPage
