"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Input } from "@/src/presentation/crm/components/ui/Input"
import { Select } from "@/src/presentation/crm/components/ui/Select"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useCreateTicket } from "@src/application/crm/di/hooks"

export function CreateTicketPage() {
  const router = useRouter()
  const { tenantId } = useAuth()

  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("MEDIUM")
  const [channel, setChannel] = useState("PORTAL")

  const { mutate: createTicket, isPending } = useCreateTicket()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Crear Ticket de Soporte Helpdesk"
        breadcrumb={[
          { label: "Tickets", href: "/support/tickets" },
          { label: "Nuevo Ticket" },
        ]}
      />

      <Card className="p-6 space-y-4 bg-card border border-border">
        <div className="space-y-2">
          <label className="text-caption text-foreground font-medium">Asunto del Ticket *</label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="ej. Error en sincronización de pagos Stripe" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-caption text-foreground font-medium">Canal de Entrada</label>
            <Select value={channel} onChange={(e) => setChannel(e.target.value)}>
              <option value="PORTAL">Portal Web de Autoservicio</option>
              <option value="WHATSAPP">WhatsApp Cloud API</option>
              <option value="EMAIL">Correo Electrónico (IMAP/SMTP)</option>
              <option value="PHONE">Telefonía VoIP / PBX</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-caption text-foreground font-medium">Prioridad SLA</label>
            <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="LOW">Baja (48h resolución)</option>
              <option value="MEDIUM">Media (24h resolución)</option>
              <option value="HIGH">Alta (8h resolución)</option>
              <option value="URGENT">Urgente / Crítica (2h SLA)</option>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-caption text-foreground font-medium">Descripción Detallada *</label>
          <textarea
            className="h-32 w-full rounded-md bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe el incidente o solicitud técnica..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="ghost" onClick={() => router.back()}>Cancelar</Button>
          <Button
            onClick={() =>
              createTicket(
                { tenantId: tenantId!, subject, description, priority, channel } as any,
                { onSuccess: () => router.push("/support/tickets") }
              )
            }
            disabled={!subject || !description || isPending}
            className="bg-cyan-600 hover:bg-cyan-500 text-white"
          >
            {isPending ? "Creando..." : "Crear Ticket"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
export default CreateTicketPage
