"use client"

import { useCallback, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, Shield, Users, User, Globe, MessageSquare, PhoneCall } from "lucide-react"
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
      header: "Contacto",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">
            {row.firstName.substring(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{row.firstName} {row.lastName || ""}</p>
            <p className="text-xs text-muted-foreground">{row.email || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Teléfono / WhatsApp",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="text-xs">
            <p className="font-mono text-slate-300">{row.phone || "—"}</p>
            {row.whatsappNumber && (
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span>WA:</span> {row.whatsappNumber}
              </p>
            )}
          </div>
          {row.phone && (
            <ClickToCallButton phoneNumber={row.phone} contactName={`${row.firstName} ${row.lastName || ""}`} contactId={row.id} />
          )}
        </div>
      ),
    },
    {
      key: "leadStatus",
      header: "Estado / Cargo",
      render: (row) => (
        <div className="flex flex-col gap-1 items-start">
          <span className="text-xs font-medium text-slate-300">{row.jobTitle || "Sin Cargo"}</span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            row.leadStatus === "CUSTOMER" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
            row.leadStatus === "QUALIFIED" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" : "bg-slate-800 text-slate-300"
          }`}>
            {row.leadStatus || "NEW"}
          </span>
        </div>
      ),
    },
    {
      key: "leadScore",
      header: "Lead Score",
      render: (row) => {
        const score = row.leadScore ?? 0
        const color = score >= 70 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : score >= 40 ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" : "text-slate-400 bg-slate-800 border-slate-700"
        return (
          <span className={`px-2 py-1 rounded-md text-xs font-bold font-mono border ${color}`}>
            {score} pts
          </span>
        )
      },
    },
    {
      key: "createdAt",
      header: "Fecha Alta",
      render: (row) => <span className="text-xs text-muted-foreground">{new Date(row.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <Button variant="ghost" size="sm" className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 text-xs" onClick={(e) => { e.stopPropagation(); setDeleteId(row.id) }}>
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
        title="Contactos & Cartera de Clientes"
        description="Gestión unificada con WhatsApp Cloud API, Click-to-Call VoIP y Lead Scoring Predictivo."
        actions={
          <Button onClick={() => setShowCreateModal(true)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium">
            <Plus className="h-4 w-4 mr-1.5" />
            Nuevo Contacto
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border text-xs text-foreground">
        <div className="flex items-center gap-2">
          <Shield size={15} className={isAgent ? "text-amber-500" : isManager ? "text-purple-500" : "text-cyan-500"} />
          <span className="font-semibold text-foreground">Jerarquía Territorial:</span>
          {isAgent && <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-mono text-[11px]">🔒 Cartera Asignada</span>}
          {isManager && <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 font-mono text-[11px]">👥 Miembros del Territorio</span>}
          {!isAgent && !isManager && <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 font-mono text-[11px]">🌐 Acceso Global</span>}
        </div>

        {!isAgent && (
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border">
            <button onClick={() => { setScope("all"); reset() }} className={`px-2.5 py-1 rounded flex items-center gap-1.5 ${scope === "all" ? "bg-cyan-500/20 text-cyan-500 font-semibold" : "text-muted-foreground hover:text-foreground"}`}><Globe size={12} /> Todo</button>
            <button onClick={() => { setScope("team"); reset() }} className={`px-2.5 py-1 rounded flex items-center gap-1.5 ${scope === "team" ? "bg-purple-500/20 text-purple-500 font-semibold" : "text-muted-foreground hover:text-foreground"}`}><Users size={12} /> Equipo</button>
            <button onClick={() => { setScope("mine"); reset() }} className={`px-2.5 py-1 rounded flex items-center gap-1.5 ${scope === "mine" ? "bg-amber-500/20 text-amber-500 font-semibold" : "text-muted-foreground hover:text-foreground"}`}><User size={12} /> Míos</button>
          </div>
        )}
      </div>

      <SearchInput value={search} onChange={handleSearchChange} placeholder="Buscar por nombre, correo, teléfono o empresa..." />

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
        <EmptyState title="No se encontraron contactos en esta cartera" />
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
        message="¿Estás seguro de que deseas eliminar este contacto de la cartera? Esta acción es irreversible."
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={() => {
          if (deleteId) deleteContact(deleteId)
          setDeleteId(null)
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
export default ContactListPage
