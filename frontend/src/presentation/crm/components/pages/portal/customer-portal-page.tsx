"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  LifeBuoy,
  FileText,
  FileCheck,
  BookOpen,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  Send,
  User,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { Avatar } from "@/src/presentation/crm/components/ui/Avatar"
import { ApiKnowledgeBaseRepository } from "@/src/infrastructure/crm/repositories/knowledge-base/api-knowledge-base.repository"
import { ApiContactRepository } from "@/src/infrastructure/crm/repositories/contacts/api-contact.repository"
import { api } from "@/src/infrastructure/crm/api/api-client"
import type { CustomerPortalOverview, KnowledgeBaseArticle } from "@crm/contracts"

export function CustomerPortalPage() {
  const router = useRouter()
  const [overview, setOverview] = useState<CustomerPortalOverview | null>(null)
  const [activeTab, setActiveTab] = useState<"TICKETS" | "QUOTES" | "KB">("TICKETS")
  const [loading, setLoading] = useState(true)

  // Ticket creation modal
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [ticketSubject, setTicketSubject] = useState("")
  const [ticketDesc, setTicketDesc] = useState("")
  const [ticketPriority, setTicketPriority] = useState("MEDIUM")
  const [savingTicket, setSavingTicket] = useState(false)

  // Active tickets & quotes data
  const [myTickets, setMyTickets] = useState<any[]>([])
  const [myQuotes, setMyQuotes] = useState<any[]>([])

  const loadPortalData = async () => {
    try {
      setLoading(true)
      const contactsList = await ApiContactRepository.list({ limit: 1 })
      const contact = contactsList.data[0]
      const contactId = contact ? contact.id : "00000000-0000-0000-0000-000000000001"

      const data = await ApiKnowledgeBaseRepository.getPortalOverview(contactId)
      setOverview(data)

      const [tList, qList] = await Promise.all([
        api.get<any>("/api/tickets?limit=20").catch(() => ({ data: [] })),
        api.get<any>("/api/quotes?limit=20").catch(() => ({ data: [] })),
      ])
      setMyTickets(Array.isArray(tList) ? tList : (tList?.data || []))
      setMyQuotes(Array.isArray(qList) ? qList : (qList?.data || []))
    } catch (err) {
      console.error("Failed to load portal overview:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPortalData()
  }, [])

  const handleCreateTicket = async () => {
    if (!ticketSubject.trim() || !ticketDesc.trim()) return
    try {
      setSavingTicket(true)
      await api.post("/api/tickets", {
        contactId: overview?.contactId,
        subject: ticketSubject.trim(),
        description: ticketDesc.trim(),
        priority: ticketPriority,
        status: "OPEN",
      })
      setShowNewTicket(false)
      setTicketSubject("")
      setTicketDesc("")
      await loadPortalData()
    } catch (err: any) {
      alert(`Error al registrar ticket: ${err?.message}`)
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Portal Header */}
      <Card className="p-6 bg-card border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={overview?.contactName || "Cliente"} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">Portal de Clientes (Self-Service)</h1>
              <Badge variant="secondary" className="text-xs">
                <ShieldCheck className="h-3 w-3 mr-1 text-primary" /> Acceso Autorizado
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Bienvenido, <span className="font-semibold text-foreground">{overview?.contactName}</span>
              {overview?.companyName && <span> • 🏢 {overview.companyName}</span>}
              {overview?.contactEmail && <span> • ✉️ {overview.contactEmail}</span>}
            </div>
          </div>
        </div>

        <Button size="sm" onClick={() => setShowNewTicket(true)}>
          <Plus className="h-4 w-4 mr-1.5" /> Abrir Ticket de Soporte
        </Button>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 bg-muted/20 border text-xs">
          <div className="text-muted-foreground flex items-center gap-1"><LifeBuoy className="h-3.5 w-3.5 text-rose-500" /> Mis Tickets Abiertos</div>
          <div className="text-xl font-bold text-foreground mt-1">{overview?.openTicketsCount ?? 0}</div>
        </Card>

        <Card className="p-3 bg-muted/20 border text-xs">
          <div className="text-muted-foreground flex items-center gap-1"><FileText className="h-3.5 w-3.5 text-primary" /> Cotizaciones Activas</div>
          <div className="text-xl font-bold text-foreground mt-1">{myQuotes.length}</div>
        </Card>

        <Card className="p-3 bg-muted/20 border text-xs">
          <div className="text-muted-foreground flex items-center gap-1"><FileCheck className="h-3.5 w-3.5 text-emerald-500" /> Contratos Vigentes</div>
          <div className="text-xl font-bold text-foreground mt-1">{overview?.activeContractsCount ?? 0}</div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Button
          size="sm"
          variant={activeTab === "TICKETS" ? "default" : "outline"}
          className="text-xs"
          onClick={() => setActiveTab("TICKETS")}
        >
          <LifeBuoy className="h-3.5 w-3.5 mr-1.5" /> Mis Tickets de Soporte
        </Button>
        <Button
          size="sm"
          variant={activeTab === "QUOTES" ? "default" : "outline"}
          className="text-xs"
          onClick={() => setActiveTab("QUOTES")}
        >
          <FileText className="h-3.5 w-3.5 mr-1.5" /> Cotizaciones & Firmas
        </Button>
        <Button
          size="sm"
          variant={activeTab === "KB" ? "default" : "outline"}
          className="text-xs"
          onClick={() => setActiveTab("KB")}
        >
          <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Centro de Ayuda
        </Button>
      </div>

      {/* Tab Content: Tickets */}
      {activeTab === "TICKETS" && (
        <Card className="p-5 border shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Historial de Solicitudes y Tickets</h2>
            <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowNewTicket(true)}>
              + Crear Ticket
            </Button>
          </div>

          {myTickets.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No tienes solicitudes de soporte abiertas en este momento.
            </div>
          ) : (
            <div className="divide-y text-xs">
              {myTickets.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between hover:bg-muted/20 px-2 rounded">
                  <div className="space-y-1">
                    <div className="font-semibold text-foreground">{t.subject}</div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1">{t.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={t.priority === "URGENT" || t.priority === "HIGH" ? "default" : "outline"} className="text-[10px]">
                      {t.priority}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">{t.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab Content: Quotes */}
      {activeTab === "QUOTES" && (
        <Card className="p-5 border shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-foreground">Mis Cotizaciones y Documentos CPQ</h2>
          {myQuotes.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No tienes cotizaciones comerciales pendientes.
            </div>
          ) : (
            <div className="divide-y text-xs">
              {myQuotes.map((q) => (
                <div key={q.id} className="py-3 flex items-center justify-between hover:bg-muted/20 px-2 rounded">
                  <div>
                    <div className="font-semibold text-foreground">{q.quoteNumber || "Cotización"}</div>
                    <div className="text-[11px] text-muted-foreground">Monto: ${Number(q.grandTotal).toLocaleString()} USD</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{q.status}</Badge>
                    <Button size="sm" variant="ghost" onClick={() => router.push(`/quotes/${q.id}`)}>
                      <ExternalLink className="h-3.5 w-3.5 mr-1" /> Ver Detalle
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab Content: Knowledge Base */}
      {activeTab === "KB" && (
        <Card className="p-5 border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Artículos y Guías Destacadas</h2>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => router.push("/kb")}>
              Ver Toda la Base de Conocimiento &rarr;
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(overview?.featuredArticles || []).map((art) => (
              <Card
                key={art.id}
                onClick={() => router.push("/kb")}
                className="p-3 border hover:border-primary cursor-pointer transition-colors space-y-1 text-xs"
              >
                <div className="font-bold text-foreground line-clamp-1">{art.title}</div>
                <div className="text-[11px] text-muted-foreground line-clamp-2">{art.summary || art.contentMarkdown}</div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Modal: New Ticket */}
      <Modal open={showNewTicket} onClose={() => setShowNewTicket(false)} title="Enviar Ticket de Soporte" size="md">
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-medium mb-1">Asunto de la Solicitud *</label>
            <input
              type="text"
              placeholder="Ej: Problema con la integración de API"
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              className="w-full p-2 border rounded bg-background text-xs"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Prioridad</label>
            <select
              value={ticketPriority}
              onChange={(e) => setTicketPriority(e.target.value)}
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
              onChange={(e) => setTicketDesc(e.target.value)}
              className="w-full p-2 border rounded bg-background text-xs"
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
