"use client"

import { useCallback, useState } from "react"
import { Plus, MessageSquare, Mail, Globe, Phone, Star } from "lucide-react"
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

  const channelIcons: Record<string, any> = {
    WHATSAPP: <MessageSquare className="h-3 w-3 text-emerald-400" />,
    EMAIL: <Mail className="h-3 w-3 text-blue-400" />,
    PORTAL: <Globe className="h-3 w-3 text-cyan-400" />,
    PHONE: <Phone className="h-3 w-3 text-purple-400" />,
  }

  const columns: ColumnDef<Ticket>[] = [
    {
      key: "subject",
      header: "Ticket & Canal",
      render: (row) => (
        <div>
          <p className="font-semibold text-foreground text-sm">{row.subject}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
            {channelIcons[(row as any).channel ?? "PORTAL"]}
            <span>{(row as any).channel || "PORTAL"}</span>
            {(row as any).csatScore && (
              <span className="flex items-center gap-0.5 text-amber-400 font-semibold ml-2">
                <Star className="h-3 w-3 fill-amber-400" /> {(row as any).csatScore}/5 CSAT
              </span>
            )}
          </div>
        </div>
      ),
    },
    { key: "status", header: "Estado", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "priority",
      header: "Prioridad SLA",
      render: (row) => {
        const p = row.priority
        const color = p === "URGENT" || p === "CRITICAL" ? "bg-rose-500/10 text-rose-400 border-rose-500/30" : p === "HIGH" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-slate-800 text-slate-300"
        return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${color}`}>{p}</span>
      },
    },
    { key: "createdAt", header: "Fecha Alta", render: (row) => new Date(row.createdAt).toLocaleDateString() },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <Button variant="ghost" size="sm" className="text-rose-400 hover:text-rose-300" onClick={(e) => { e.stopPropagation(); setDeleteId(row.id) }}>
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
        title="Tickets de Soporte & Helpdesk Omnicanal"
        description="Gestión de incidentes con SLA Tracking, WhatsApp, Correo y Encuestas de Satisfacción CSAT."
        actions={
          <Button onClick={() => router.push("/support/tickets/new")} className="bg-cyan-600 hover:bg-cyan-500 text-white">
            <Plus className="h-4 w-4 mr-1.5" />
            Nuevo Ticket
          </Button>
        }
      />
      <SearchInput value={search} onChange={handleSearchChange} placeholder="Buscar tickets por asunto o descripción..." />
      <FilterBar
        filters={[
          {
            key: "status",
            label: "Estado",
            options: [
              { value: "OPEN", label: "Abierto" },
              { value: "PENDING", label: "En Espera" },
              { value: "RESOLVED", label: "Resuelto" },
              { value: "CLOSED", label: "Cerrado" },
            ],
          },
          {
            key: "priority",
            label: "Prioridad",
            options: [
              { value: "LOW", label: "Baja" },
              { value: "MEDIUM", label: "Media" },
              { value: "HIGH", label: "Alta" },
              { value: "URGENT", label: "Urgente" },
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
          onRowClick={(row) => router.push(`/support/tickets/${row.id}`)}
        />
      ) : (
        <EmptyState title="No se encontraron tickets registrados" />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Eliminar ticket"
        message="¿Estás seguro de que deseas eliminar este ticket?"
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={() => deleteId && deleteTicket(deleteId, { onSuccess: () => setDeleteId(null) })}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
export default TicketListPage
