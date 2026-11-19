"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  LifeBuoy,
  FileText,
  FileCheck,
  BookOpen,
  Plus,
  ExternalLink,
  Send,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { Avatar } from "@/src/presentation/crm/components/ui/Avatar"
import { ApiKnowledgeBaseRepository } from "@/src/infrastructure/crm/repositories/knowledge-base/api-knowledge-base.repository"
import { api } from "@/src/infrastructure/crm/api/api-client"
import type { CustomerPortalOverview } from "@crm/contracts"

interface CustomerPortalTicket {
  id: string
  subject: string
  description: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
}

interface CustomerPortalQuote {
  id: string
  quoteNumber: string
  status: string
  grandTotal: string | number
  currency: string
  validUntil: string
  createdAt: string
}

interface CustomerPortalPayload {
  overview: CustomerPortalOverview
  tickets: CustomerPortalTicket[]
  quotes: CustomerPortalQuote[]
}

export function CustomerPortalPage() {
  const router = useRouter()
  const [overview, setOverview] = useState<CustomerPortalOverview | null>(null)
  const [activeTab, setActiveTab] = useState<"TICKETS" | "QUOTES" | "KB">("TICKETS")
  const [loading, setLoading] = useState(true)
  const [portalAccessDenied, setPortalAccessDenied] = useState(false)
  const [portalError, setPortalError] = useState("")

  const [showNewTicket, setShowNewTicket] = useState(false)
  const [ticketSubject, setTicketSubject] = useState("")
  const [ticketDesc, setTicketDesc] = useState("")
  const [ticketPriority, setTicketPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM")
  const [savingTicket, setSavingTicket] = useState(false)

  const [myTickets, setMyTickets] = useState<CustomerPortalTicket[]>([])
  const [myQuotes, setMyQuotes] = useState<CustomerPortalQuote[]>([])

  const loadPortalData = useCallback(async () => {
    setLoading(true)
    setPortalError("")
    setPortalAccessDenied(false)

    try {
      // The backend derives tenant/contact identity from signed portal JWT claims.
      // The browser never selects a contact and never calls tenant-wide list endpoints.
      const data = await api.get<CustomerPortalPayload>("/api/customer-portal/me")
      setOverview(data.overview)
      setMyTickets(Array.isArray(data.tickets) ? data.tickets : [])
      setMyQuotes(Array.isArray(data.quotes) ? data.quotes : [])
    } catch (error) {
      setOverview(null)
      setMyTickets([])
      setMyQuotes([])
      setPortalAccessDenied(true)
      setPortalError(
        error instanceof Error && error.message
          ? error.message
          : "La sesión no tiene una identidad de portal de cliente verificada.",
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPortalData()
  }, [loadPortalData])

  const handleCreateTicket = async () => {
    if (!ticketSubject.trim() || !ticketDesc.trim()) return

    try {
      setSavingTicket(true)
      await api.post("/api/customer-portal/tickets", {
        subject: ticketSubject.trim(),
        description: ticketDesc.trim(),
        priority: ticketPriority,
      })
      setShowNewTicket(false)
      setTicketSubject("")
      setTicketDesc("")
      await loadPortalData()
    } catch (error) {
      alert(`No se pudo registrar el ticket: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setSavingTicket(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto p-4">
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (portalAccessDenied || !overview) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <Card className="p-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Acceso al portal no autorizado</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Esta sesión no está vinculada a un contacto de cliente verificado. Por seguridad no se consultaron contactos, tickets ni cotizaciones.
            </p>
          </div>
          {portalError && <p role="alert" className="text-xs text-muted-foreground">{portalError}</p>}
          <p className="text-xs text-muted-foreground">
            El acceso requiere una credencial de portal emitida y firmada para el contacto correspondiente. Una sesión normal del CRM no habilita el portal de clientes.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <Card className="p-6 bg-card border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={overview.contactName || "Cliente"} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">Portal de Clientes (Self-Service)</h1>
              <Badge variant="secondary" className="text-xs">
                <ShieldCheck className="h-3 w-3 mr-1 text-primary" /> Identidad de cliente verificada
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Bienvenido, <span className="font-semibold text-foreground">{overview.contactName}</span>
              {overview.companyName && <span> • 🏢 {overview.companyName}</span>}
              {overview.contactEmail && <span> • ✉️ {overview.contactEmail}</span>}
            </div>
          </div>
        </div>

        <Button size="sm" onClick={() => setShowNewTicket(true)}>
          <Plus className="h-4 w-4 mr-1.5" /> Abrir Ticket de Soporte
        </Button>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 bg-muted/20 border text-xs">
          <div className="text-muted-foreground flex items-center gap-1"><LifeBuoy className="h-3.5 w-3.5 text-rose-500" /> Mis Tickets Abiertos</div>
          <div className="text-xl font-bold text-foreground mt-1">{overview.openTicketsCount ?? 0}</div>
        </Card>

        <Card className="p-3 bg-muted/20 border text-xs">
          <div className="text-muted-foreground flex items-center gap-1"><FileText className="h-3.5 w-3.5 text-primary" /> Cotizaciones Activas</div>
          <div className="text-xl font-bold text-foreground mt-1">{myQuotes.length}</div>
        </Card>

        <Card className="p-3 bg-muted/20 border text-xs">
          <div className="text-muted-foreground flex items-center gap-1"><FileCheck className="h-3.5 w-3.5 text-emerald-500" /> Contratos Vigentes</div>
          <div className="text-xl font-bold text-foreground mt-1">{overview.activeContractsCount ?? 0}</div>
        </Card>
      </div>

      <div className="flex gap-2 border-b pb-2">
        <Button size="sm" variant={activeTab === "TICKETS" ? "default" : "outline"} className="text-xs" onClick={() => setActiveTab("TICKETS")}>
          <LifeBuoy className="h-3.5 w-3.5 mr-1.5" /> Mis Tickets de Soporte
        </Button>
        <Button size="sm" variant={activeTab === "QUOTES" ? "default" : "outline"} className="text-xs" onClick={() => setActiveTab("QUOTES")}>
          <FileText className="h-3.5 w-3.5 mr-1.5" /> Cotizaciones & Firmas
        </Button>
        <Button size="sm" variant={activeTab === "KB" ? "default" : "outline"} className="text-xs" onClick={() => setActiveTab("KB")}>
          <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Centro de Ayuda
        </Button>
      </div>

      {activeTab === "TICKETS" && (
        <Card className="p-5 border shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Historial de Solicitudes y Tickets</h2>
            <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowNewTicket(true)}>+ Crear Ticket</Button>
          </div>

          {myTickets.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">No tienes solicitudes de soporte abiertas en este momento.</div>
          ) : (
            <div className="divide-y text-xs">
              {myTickets.map((ticket) => (
                <div key={ticket.id} className="py-3 flex items-center justify-between hover:bg-muted/20 px-2 rounded">
                  <div className="space-y-1">
                    <div className="font-semibold text-foreground">{ticket.subject}</div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1">{ticket.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={ticket.priority === "URGENT" || ticket.priority === "HIGH" ? "default" : "outline"} className="text-[10px]">{ticket.priority}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{ticket.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === "QUOTES" && (
        <Card className="p-5 border shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-foreground">Mis Cotizaciones y Documentos CPQ</h2>
          {myQuotes.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">No tienes cotizaciones comerciales pendientes.</div>
          ) : (
            <div className="divide-y text-xs">
              {myQuotes.map((quote) => (
                <div key={quote.id} className="py-3 flex items-center justify-between hover:bg-muted/20 px-2 rounded">
                  <div>
                    <div className="font-semibold text-foreground">{quote.quoteNumber || "Cotización"}</div>
                    <div className="text-[11px] text-muted-foreground">
                      Monto: {quote.currency} {Number(quote.grandTotal).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{quote.status}</Badge>
                    <span className="text-[10px] text-muted-foreground">Vence: {quote.validUntil}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === "KB" && (
        <Card className="p-5 border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Artículos y Guías Destacadas</h2>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => router.push("/kb")}>
              Ver Toda la Base de Conocimiento &rarr;
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(overview.featuredArticles || []).map((article) => (
              <Card
                key={article.id}
                onClick={() => router.push("/kb")}
                className="p-3 border hover:border-primary cursor-pointer transition-colors space-y-1 text-xs"
              >
                <div className="font-bold text-foreground line-clamp-1">{article.title}</div>
                <div className="text-[11px] text-muted-foreground line-clamp-2">{article.summary || article.contentMarkdown}</div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      <Modal open={showNewTicket} onClose={() => setShowNewTicket(false)} title="Enviar Ticket de Soporte" size="md">
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-medium mb-1">Asunto de la Solicitud *</label>
            <input
              type="text"
              placeholder="Ej: Problema con la integración de API"
              value={ticketSubject}
              onChange={(event) => setTicketSubject(event.target.value)}
              className="w-full p-2 border rounded bg-background text-xs"
              maxLength={255}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Prioridad</label>
            <select
              value={ticketPriority}
              onChange={(event) => setTicketPriority(event.target.value as typeof ticketPriority)}
              className="w-full p-2 border rounded bg-background text-xs"
            >
              <option value="LOW">Baja (Consulta general)</option>
              <option value="MEDIUM">Media (Comportamiento inesperado)</option>
              <option value="HIGH">Alta (Afecta operaciones)</option>
              <option value="URGENT">Urgente (Servicio caído)</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Descripción Detallada *</label>
            <textarea
              rows={4}
              placeholder="Explica detalladamente qué sucedió o qué necesitas..."
              value={ticketDesc}
              onChange={(event) => setTicketDesc(event.target.value)}
              className="w-full p-2 border rounded bg-background text-xs"
              maxLength={10000}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowNewTicket(false)} disabled={savingTicket}>Cancelar</Button>
            <Button onClick={handleCreateTicket} disabled={savingTicket || !ticketSubject.trim() || !ticketDesc.trim()}>
              <Send className="h-3.5 w-3.5 mr-1" />
              {savingTicket ? "Enviando..." : "Registrar Ticket"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
