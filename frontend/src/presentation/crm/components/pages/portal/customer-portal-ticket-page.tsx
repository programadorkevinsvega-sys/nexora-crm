"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Send, LifeBuoy, ShieldCheck } from "lucide-react"
import { api } from "@/src/infrastructure/crm/api/api-client"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"

interface PortalTicket {
  id: string
  subject: string
  description: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
}

interface PortalTicketReply {
  id: string
  ticketId: string
  authorType: string
  message: string
  createdAt: string
}

interface TicketRepliesPayload {
  data: PortalTicketReply[]
}

export function CustomerPortalTicketPage({ ticketId }: { ticketId: string }) {
  const [ticket, setTicket] = useState<PortalTicket | null>(null)
  const [replies, setReplies] = useState<PortalTicketReply[]>([])
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  const loadTicket = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [detail, thread] = await Promise.all([
        api.get<PortalTicket>(`/api/customer-portal/tickets/${ticketId}`),
        api.get<TicketRepliesPayload>(`/api/customer-portal/tickets/${ticketId}/replies`),
      ])
      setTicket(detail)
      setReplies(Array.isArray(thread.data) ? thread.data : [])
    } catch (loadError) {
      setTicket(null)
      setReplies([])
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el ticket.")
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  useEffect(() => {
    void loadTicket()
  }, [loadTicket])

  const sendReply = async () => {
    if (!message.trim() || sending) return
    setSending(true)
    setError("")
    try {
      await api.post(`/api/customer-portal/tickets/${ticketId}/replies`, { message: message.trim() })
      setMessage("")
      await loadTicket()
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "No se pudo enviar la respuesta.")
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto space-y-4 p-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-48 w-full" /><Skeleton className="h-40 w-full" /></div>
  }

  if (!ticket) {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <Card className="p-8 space-y-3">
          <h1 className="text-lg font-bold">No se pudo encontrar el ticket</h1>
          <p className="text-sm text-muted-foreground">{error || "El ticket no existe o no pertenece a tu cuenta."}</p>
          <Link className="text-sm text-primary underline" href="/portal">Volver al portal</Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-5 pb-12">
      <Link href="/portal" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver al portal
      </Link>
      <Card className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><LifeBuoy className="h-4 w-4" /> Solicitud de soporte</div>
            <h1 className="text-xl font-bold">{ticket.subject}</h1>
          </div>
          <Badge variant="secondary">{ticket.status}</Badge>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>Prioridad: {ticket.priority}</span>
          <span>·</span>
          <span>Creado: {new Date(ticket.createdAt).toLocaleString()}</span>
        </div>
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /><h2 className="font-semibold">Conversación</h2></div>
        {replies.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay respuestas públicas en esta solicitud.</p>
        ) : (
          <div className="space-y-3">
            {replies.map((reply) => (
              <div key={reply.id} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{reply.authorType === "CUSTOMER" ? "Tú" : reply.authorType === "SYSTEM" ? "Sistema" : "Equipo de soporte"}</span>
                  <time dateTime={reply.createdAt}>{new Date(reply.createdAt).toLocaleString()}</time>
                </div>
                <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
              </div>
            ))}
          </div>
        )}
        {ticket.status === "CLOSED" ? (
          <p className="text-sm text-muted-foreground">Esta solicitud está cerrada. Abre un nuevo ticket para continuar con el soporte.</p>
        ) : (
          <div className="space-y-3 border-t pt-4">
            <label htmlFor="ticket-reply" className="text-sm font-medium">Agregar respuesta</label>
            <textarea id="ticket-reply" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={10000} rows={4} className="w-full rounded-md border bg-background p-3 text-sm" placeholder="Escribe información adicional o responde al equipo de soporte..." />
            <div className="flex justify-end">
              <Button onClick={sendReply} disabled={sending || !message.trim()}>
                <Send className="h-4 w-4 mr-2" /> {sending ? "Enviando..." : "Enviar respuesta"}
              </Button>
            </div>
          </div>
        )}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </Card>
    </div>
  )
}
