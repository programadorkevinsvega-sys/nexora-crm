"use client"

import { useCallback, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, Shield, Users, User, Globe } from "lucide-react"
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
import { useContactsList, useDeleteContact } from "@src/application/crm/di/hooks"
import { CreateContactModal } from "@/src/presentation/crm/components/modules/contacts/create-contact-modal"
import { ClickToCallButton } from "@/src/presentation/crm/components/common/click-to-call-button"
import type { Contact } from "@/src/domain/crm/contacts/contact.entity"

export function ContactListPage() {
  const router = useRouter()
  const { tenantId, userRole, userId } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [scope, setScope] = useState<"all" | "mine" | "team">("all")

  const isAgent = (userRole || "").toLowerCase() === "agent"
  const isManager = (userRole || "").toLowerCase() === "manager"

  const effectiveAssignedUserId = isAgent ? (userId || undefined) : scope === "mine" ? (userId || undefined) : undefined

  const queryResult = useContactsList({
    tenantId: tenantId!,
    search,
    cursor,
    assignedUserId: effectiveAssignedUserId,
  })
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
    {
      key: "phone",
      header: "Phone",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span>{row.phone || "—"}</span>
          {row.phone && (
            <ClickToCallButton
              phoneNumber={row.phone}
              contactName={`${row.firstName} ${row.lastName || ""}`}
              contactId={row.id}
            />
          )}
        </div>
      ),
    },
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
        title="Contactos & Cartera de Clientes"
        description="Gestión unificada con control de visibilidad territorial y asignación"
        actions={
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Contact
          </Button>
        }
      />

      {/* Visibility & Territory Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border text-xs text-foreground">
        <div className="flex items-center gap-2">
          <Shield size={15} className={isAgent ? "text-amber-500" : isManager ? "text-purple-500" : "text-cyan-500"} />
          <span className="font-semibold text-foreground">Jerarquía Territorial:</span>
          {isAgent && (
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-mono text-[11px] border border-amber-500/20">
              🔒 Modo Vendedor (Solo contactos asignados a tu cartera)
            </span>
          )}
          {isManager && (
            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 font-mono text-[11px] border border-purple-500/20">
              👥 Modo Gerente (Territorio & Miembros de Equipo)
            </span>
          )}
          {!isAgent && !isManager && (
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 font-mono text-[11px] border border-cyan-500/20">
              🌐 Modo Administrador (Acceso Global a la Organización)
            </span>
          )}
        </div>

        {!isAgent && (
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border self-end sm:self-auto">
            <button
              onClick={() => { setScope("all"); reset() }}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${scope === "all" ? "bg-cyan-500/20 text-cyan-500 font-semibold" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Globe size={12} /> Todo el CRM
            </button>
            <button
              onClick={() => { setScope("team"); reset() }}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${scope === "team" ? "bg-purple-500/20 text-purple-500 font-semibold" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Users size={12} /> Mi Equipo
            </button>
            <button
              onClick={() => { setScope("mine"); reset() }}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${scope === "mine" ? "bg-amber-500/20 text-amber-500 font-semibold" : "text-muted-foreground hover:text-foreground"}`}
            >
              <User size={12} /> Solo Míos
            </button>
          </div>
        )}
      </div>

      <SearchInput value={search} onChange={handleSearchChange} placeholder="Buscar contactos..." />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : items.length > 0 ? (
        <DataTable
          columns={columns}
          data={items}
          nextCursor={nextCursor}
          onLoadMore={loadMore}
          loadingMore={isLoadingMore}
          onRowClick={(row) => router.push(`/contacts/${row.id}`)}
        />
      ) : (
        <EmptyState title="No se encontraron contactos" description="No hay registros disponibles bajo el filtro de visibilidad seleccionado." />
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
        title="Eliminar contacto"
        message="¿Estás seguro de eliminar este contacto? Esta acción es irreversible."
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={() => { if (deleteId) deleteContact(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
export default ContactListPage
