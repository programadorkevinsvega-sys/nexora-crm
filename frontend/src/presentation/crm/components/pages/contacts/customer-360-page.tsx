"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
  Award,
  LifeBuoy,
  Flame,
  Plus,
  Send,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { Avatar } from "@/src/presentation/crm/components/ui/Avatar"
import { ApiCustomer360Repository } from "@/src/infrastructure/crm/repositories/customer-360/api-customer-360.repository"
import { ApiInboxRepository } from "@/src/infrastructure/crm/repositories/inbox/api-inbox.repository"
import { ContactEnrichmentCard } from "@src/presentation/crm/components/pages/contacts/contact-enrichment-card"
import { CustomerHealthScoreCard } from "@src/presentation/crm/components/pages/contacts/customer-health-score-card"
import type { Customer360Profile, CustomerTimelineItem, TimelineItemType } from "@crm/contracts"

export function Customer360Page() {
  const params = useParams()
  const router = useRouter()
  const contactId = params.id as string

  const [profile, setProfile] = useState<Customer360Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<string>("ALL")
  const [searchTerm, setSearchTerm] = useState("")

  // Quick Action Modals
  const [actionModal, setActionModal] = useState<"WHATSAPP" | "EMAIL" | "NOTE" | null>(null)
  const [messageText, setMessageText] = useState("")
  const [subjectText, setSubjectText] = useState("")
  const [sending, setSending] = useState(false)

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await ApiCustomer360Repository.getCustomer360(contactId)
      setProfile(data)
    } catch (err) {
      console.error("Failed to load customer 360:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (contactId) fetchProfile()
  }, [contactId])

  const handleSendQuickAction = async () => {
    if (!messageText.trim()) return
    try {
      setSending(true)
      if (actionModal === "WHATSAPP") {
        await ApiInboxRepository.sendMessage({
          contactId,
          channel: "WHATSAPP",
          recipientIdentifier: profile?.phone || "+573000000000",
          bodyText: messageText.trim(),
        })
      } else if (actionModal === "EMAIL") {
        await ApiInboxRepository.sendMessage({
          contactId,
          channel: "EMAIL",
          recipientIdentifier: profile?.email || "cliente@example.com",
          subject: subjectText.trim() || "Contacto Nexora CRM",
          bodyText: messageText.trim(),
        })
      }
      setActionModal(null)
      setMessageText("")
      setSubjectText("")
      await fetchProfile()
    } catch (err: any) {
      alert(`Error al enviar mensaje: ${err?.message}`)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto p-4">
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center p-12 space-y-4">
        <div className="text-base font-bold">Perfil Customer 360 no encontrado</div>
        <Button onClick={() => router.push("/contacts")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver a Contactos
        </Button>
      </div>
    )
  }

  const { metrics, timeline } = profile

  const filteredTimeline = timeline.filter((item) => {
    if (activeFilter === "MESSAGES" && !["WHATSAPP", "EMAIL", "SMS"].includes(item.type)) return false
    if (activeFilter === "SALES" && !["DEAL", "QUOTE", "CONTRACT"].includes(item.type)) return false
    if (activeFilter === "SUPPORT" && item.type !== "TICKET") return false
    if (activeFilter === "ACTIVITIES" && !["NOTE", "CALL", "TASK", "MEETING"].includes(item.type)) return false

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const titleMatch = item.title.toLowerCase().includes(term)
      const descMatch = (item.description || "").toLowerCase().includes(term)
      if (!titleMatch && !descMatch) return false
    }
    return true
  })

  const getTimelineIcon = (type: TimelineItemType) => {
    switch (type) {
      case "WHATSAPP":
        return <MessageSquare className="h-4 w-4 text-emerald-500" />
      case "EMAIL":
        return <Mail className="h-4 w-4 text-sky-500" />
      case "CALL":
        return <Phone className="h-4 w-4 text-indigo-500" />
      case "MEETING":
        return <Calendar className="h-4 w-4 text-purple-500" />
      case "NOTE":
        return <FileText className="h-4 w-4 text-amber-500" />
      case "DEAL":
        return <DollarSign className="h-4 w-4 text-green-500" />
      case "TICKET":
        return <LifeBuoy className="h-4 w-4 text-rose-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Back Button & Top Profile Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/contacts/${contactId}`)}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver a Detalles
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/inbox")}>
            <MessageSquare className="h-4 w-4 mr-1.5 text-primary" /> Ir a Bandeja Omnicanal
          </Button>
        </div>
      </div>

      {/* Customer 360 Main Banner */}
      <Card className="p-6 bg-card border shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={`${profile.firstName} ${profile.lastName || ""}`} size="lg" />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-foreground">
                  {profile.firstName} {profile.lastName || ""}
                </h1>
                <Badge
                  variant={
                    metrics.leadTemperature === "HOT"
                      ? "default"
                      : metrics.leadTemperature === "WARM"
                      ? "secondary"
                      : "outline"
                  }
                  className="font-mono text-xs"
                >
                  <Flame className="h-3 w-3 mr-1 text-orange-500 fill-orange-500" />
                  Score: {metrics.leadScore} pts ({metrics.leadTemperature})
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">
                {profile.jobTitle && <span>💼 {profile.jobTitle}</span>}
                {profile.companyName && <span>🏢 {profile.companyName}</span>}
                {profile.email && <span>✉️ {profile.email}</span>}
                {profile.phone && <span>📞 {profile.phone}</span>}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Button size="sm" variant="outline" onClick={() => setActionModal("WHATSAPP")}>
              <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-emerald-600" /> WhatsApp
            </Button>
            <Button size="sm" variant="outline" onClick={() => setActionModal("EMAIL")}>
              <Mail className="h-3.5 w-3.5 mr-1.5 text-sky-600" /> Correo
            </Button>
          </div>
        </div>
      </Card>

      {/* Financial & Engagement KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3 bg-muted/20 border">
          <div className="text-[11px] font-medium text-muted-foreground">Lifetime Value (LTV)</div>
          <div className="text-lg font-bold text-foreground mt-1">
            ${metrics.ltv.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">USD</span>
          </div>
        </Card>

        <Card className="p-3 bg-muted/20 border">
          <div className="text-[11px] font-medium text-muted-foreground">MRR Recurrente</div>
          <div className="text-lg font-bold text-emerald-600 mt-1">
            ${metrics.mrr.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">/mes</span>
          </div>
        </Card>

        <Card className="p-3 bg-muted/20 border">
          <div className="text-[11px] font-medium text-muted-foreground">Pipeline Activo</div>
          <div className="text-lg font-bold text-primary mt-1">
            ${metrics.activePipelineValue.toLocaleString()}
          </div>
        </Card>

        <Card className="p-3 bg-muted/20 border">
          <div className="text-[11px] font-medium text-muted-foreground">Puntos de Lealtad</div>
          <div className="text-lg font-bold text-amber-600 mt-1 flex items-center gap-1">
            <Award className="h-4 w-4" /> {metrics.loyaltyPoints.toLocaleString()}
          </div>
        </Card>

        <Card className="p-3 bg-muted/20 border">
          <div className="text-[11px] font-medium text-muted-foreground">Tickets de Soporte</div>
          <div className="text-lg font-bold text-foreground mt-1">
            {metrics.openTicketsCount}{" "}
            <span className="text-[10px] font-normal text-muted-foreground">abiertos</span>
          </div>
        </Card>

        <Card className="p-3 bg-muted/20 border">
          <div className="text-[11px] font-medium text-muted-foreground">Total Negocios</div>
          <div className="text-lg font-bold text-foreground mt-1">{metrics.totalDealsCount}</div>
        </Card>
      </div>

      <CustomerHealthScoreCard contactId={contactId} />

      <ContactEnrichmentCard contactId={contactId} contactEmail={profile.email} />

      {/* Universal Chronological Timeline */}
      <Card className="p-5 border shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" /> Timeline Universal Consolidado
            </h2>
            <p className="text-xs text-muted-foreground">
              Historial cronológico unificado de todas las interacciones, mensajes, negocios y tickets.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-56">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar en timeline..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border bg-background"
              />
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "ALL", label: `Todos (${timeline.length})` },
            { id: "MESSAGES", label: "💬 Mensajes (WhatsApp / Email)" },
            { id: "SALES", label: "💼 Negocios & CPQ" },
            { id: "SUPPORT", label: "🎫 Soporte & Tickets" },
            { id: "ACTIVITIES", label: "📋 Notas & Llamadas" },
          ].map((f) => (
            <Button
              key={f.id}
              size="sm"
              variant={activeFilter === f.id ? "default" : "outline"}
              className="text-xs h-7 px-2.5"
              onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* Timeline Events Feed */}
        {filteredTimeline.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No se encontraron eventos en este criterio de búsqueda.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
            {filteredTimeline.map((item) => (
              <div key={item.id} className="relative group">
                <div className="absolute -left-6 mt-1.5 h-5 w-5 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                  {getTimelineIcon(item.type)}
                </div>
                <div className="p-3 bg-muted/20 hover:bg-muted/40 transition-colors border rounded-md text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{item.title}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {item.description && (
                    <div className="text-muted-foreground whitespace-pre-wrap">{item.description}</div>
                  )}
                  {item.status && (
                    <div className="pt-1">
                      <Badge variant="outline" className="text-[10px]">
                        Estado: {item.status}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Action Modal */}
      {actionModal && (
        <Modal
          open={!!actionModal}
          onClose={() => setActionModal(null)}
          title={
            actionModal === "WHATSAPP"
              ? `Enviar WhatsApp a ${profile.firstName}`
              : `Enviar Correo Electrónico a ${profile.firstName}`
          }
          size="md"
        >
          <div className="space-y-3">
            {actionModal === "EMAIL" && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Asunto *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background font-medium"
                  placeholder="Asunto del correo..."
                  value={subjectText}
                  onChange={(e) => setSubjectText(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Mensaje *</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md text-xs bg-background"
                rows={4}
                placeholder="Escribe tu mensaje aquí..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setActionModal(null)} disabled={sending}>
                Cancelar
              </Button>
              <Button onClick={handleSendQuickAction} disabled={sending}>
                <Send className="h-3.5 w-3.5 mr-1" />
                {sending ? "Enviando..." : "Enviar Mensaje"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
