"use client"

import { useState } from "react"
import { Plus, Mail } from "lucide-react"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { EmptyState } from "@/src/presentation/crm/components/common/EmptyState"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { Badge } from "@/src/presentation/crm/components/ui/Badge"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useMailboxesList } from "@src/application/crm/di/hooks"
import { ApiHelpdeskRepository } from "@/src/infrastructure/crm/repositories/helpdesk/api-helpdesk.repository"
import { useQueryClient } from "@tanstack/react-query"

export function MailboxListPage() {
  const { tenantId } = useAuth()
  const queryClient = useQueryClient()
  const { data, isLoading, isError, error } = useMailboxesList()

  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState("")
  const [emailAddress, setEmailAddress] = useState("")
  const [inboundAddress, setInboundAddress] = useState("")
  const [saving, setSaving] = useState(false)

  const rawList: any = data
  const mailboxes: any[] = Array.isArray(rawList)
    ? rawList
    : Array.isArray(rawList?.data)
      ? rawList.data
      : []

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !emailAddress.trim()) return
    setSaving(true)
    try {
      await ApiHelpdeskRepository.createMailbox({
        tenantId: tenantId || "00000000-0000-0000-0000-000000000001",
        name: name.trim(),
        emailAddress: emailAddress.trim(),
      })
      setShowCreate(false)
      setName("")
      setEmailAddress("")
      setInboundAddress("")
      queryClient.invalidateQueries({ queryKey: ["mailboxes"] })
    } catch (err: any) {
      alert(`Error al crear buzón: ${err?.message || err}`)
    } finally {
      setSaving(false)
    }
  }

  if (isError) return <ErrorState message={error?.message} />

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Buzones de Soporte (Helpdesk Mailboxes)"
        description="Gestiona las direcciones de correo de entrada para convertir emails en tickets automáticamente."
        actions={
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Nuevo Buzón
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : mailboxes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mailboxes.map((mailbox: any) => (
            <Card key={mailbox.id} className="p-5 space-y-3 border shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Mail className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{mailbox.name}</h3>
                </div>
                <Badge variant={mailbox.isActive !== false ? "success" : "default"}>
                  {mailbox.isActive !== false ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono truncate">{mailbox.emailAddress}</p>
              {mailbox.inboundAddress && (
                <p className="text-[11px] text-muted-foreground">
                  Inbound: <span className="font-mono">{mailbox.inboundAddress}</span>
                </p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No hay buzones configurados"
          description="Crea tu primer buzón de soporte para recibir tickets por correo electrónico."
          action={
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Crear Primer Buzón
            </Button>
          }
        />
      )}

      {/* Create Mailbox Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="📬 Nuevo Buzón de Soporte">
        <form onSubmit={handleCreate} className="space-y-4 min-w-[380px]">
          <div>
            <label className="block text-xs font-medium mb-1">Nombre del Buzón *</label>
            <input
              type="text"
              required
              placeholder="Ej: Soporte Técnico, Ventas, Facturación..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-md bg-background text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Dirección de Correo *</label>
            <input
              type="email"
              required
              placeholder="soporte@tuempresa.com"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="w-full p-2 border rounded-md bg-background text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Alias Inbound (opcional)</label>
            <input
              type="text"
              placeholder="soporte-inbound@tuempresa.com"
              value={inboundAddress}
              onChange={(e) => setInboundAddress(e.target.value)}
              className="w-full p-2 border rounded-md bg-background text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowCreate(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={saving || !name.trim() || !emailAddress.trim()}>
              {saving ? "Guardando..." : "Crear Buzón"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default MailboxListPage
