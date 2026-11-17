"use client"

import { useParams, useRouter } from "next/navigation"
import { Trash2, MessageSquare, Mail, Globe, Phone, Star, ShieldAlert } from "lucide-react"
import { useState } from "react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Tabs } from "@/src/presentation/crm/components/ui/Tabs"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { EntityCard } from "@/src/presentation/crm/components/common/EntityCard"
import { StatusBadge } from "@/src/presentation/crm/components/common/StatusBadge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { TicketReplySection } from "@/src/presentation/crm/components/modules/tickets/ticket-reply-section"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useTicket, useDeleteTicket, useUpdateTicket } from "@src/application/crm/di/hooks"

export function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [showDelete, setShowDelete] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const id = params.id as string

  const { data: ticket, isLoading, isError, error } = useTicket(id)
  const { mutate: deleteTicket } = useDeleteTicket()
  const { mutate: updateTicket } = useUpdateTicket()

  if (isError) return <ErrorState message={error?.message} />
  if (isLoading) return <Skeleton className="h-96" />
  if (!ticket) return <div className="text-body text-ash">Ticket no encontrado</div>

  const channelIcons: Record<string, any> = {
    WHATSAPP: <MessageSquare className="h-4 w-4 text-emerald-400" />,
    EMAIL: <Mail className="h-4 w-4 text-blue-400" />,
    PORTAL: <Globe className="h-4 w-4 text-cyan-400" />,
    PHONE: <Phone className="h-4 w-4 text-purple-400" />,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={ticket.subject}
        breadcrumb={[{ label: "Tickets", href: "/support/tickets" }, { label: ticket.subject }]}
        actions={
          <div className="flex gap-2">
            {ticket.status === "OPEN" && (
              <Button onClick={() => updateTicket({ id, data: { status: "RESOLVED" } })} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                Marcar Resuelto
              </Button>
            )}
            <Button variant="danger" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-4 w-4 mr-1" /> Eliminar
            </Button>
          </div>
        }
      />

      <Tabs
        tabs={[{ id: "details", label: "Detalles del Incidente" }, { id: "replies", label: "Conversación & Respuestas" }]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "details" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <EntityCard title="Información del Ticket">
              <div className="space-y-4">
                <div>
                  <p className="text-caption text-muted-foreground">Descripción del Problema</p>
                  <p className="text-body text-foreground mt-1 whitespace-pre-wrap">{ticket.description}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-caption text-muted-foreground">Canal de Entrada</p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-foreground">
                      {channelIcons[(ticket as any).channel ?? "PORTAL"]}
                      <span>{(ticket as any).channel || "PORTAL"}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-caption text-muted-foreground">Estado</p>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <div>
                    <p className="text-caption text-muted-foreground">Prioridad SLA</p>
                    <Badge variant={ticket.priority === "CRITICAL" || ticket.priority === "URGENT" ? "danger" : ticket.priority === "HIGH" ? "warning" : "default"}>
                      {ticket.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-caption text-muted-foreground">Nivel de Escalamiento</p>
                    <span className="text-xs font-bold text-foreground">Nivel {(ticket as any).escalationLevel ?? 1}</span>
                  </div>
                  {(ticket as any).csatScore && (
                    <div>
                      <p className="text-caption text-muted-foreground">Satisfacción CSAT</p>
                      <span className="flex items-center gap-1 text-amber-400 font-bold text-xs mt-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400" /> {(ticket as any).csatScore} / 5
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </EntityCard>
          </div>

          <div className="space-y-4">
            <Card className="p-4 bg-card border border-border">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Transición de Estado</h3>
              <div className="flex flex-wrap gap-1.5">
                <Button size="sm" variant="ghost" className="text-xs" onClick={() => updateTicket({ id, data: { status: "OPEN" } })}>Abierto</Button>
                <Button size="sm" variant="ghost" className="text-xs" onClick={() => updateTicket({ id, data: { status: "PENDING" } })}>En Espera</Button>
                <Button size="sm" variant="ghost" className="text-xs text-emerald-400" onClick={() => updateTicket({ id, data: { status: "RESOLVED" } })}>Resuelto</Button>
                <Button size="sm" variant="ghost" className="text-xs text-slate-400" onClick={() => updateTicket({ id, data: { status: "CLOSED" } })}>Cerrado</Button>
              </div>
            </Card>

            <Card className="p-4 bg-card border border-border">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Fechas de Gestión</h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Fecha Creación: {new Date(ticket.createdAt).toLocaleDateString()}</p>
                <p>Última Respuesta: {new Date(ticket.updatedAt).toLocaleDateString()}</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "replies" && <TicketReplySection ticketId={id} />}

      <ConfirmDialog
        open={showDelete}
        title="Eliminar ticket"
        message={`¿Estás seguro de eliminar "${ticket.subject}"?`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={() => deleteTicket(id, { onSuccess: () => router.push("/support/tickets") })}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
export default TicketDetailPage
