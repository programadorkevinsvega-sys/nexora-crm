"use client"

import { useCallback, useEffect, useState } from "react"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { api } from "@/src/infrastructure/crm/api/api-client"

type PortalInvitation = {
  id: string
  contactId: string
  email: string
  status: "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED"
  expiresAt: string
  createdAt: string
}

export function ContactPortalAccessCard({ contactId, email }: { contactId: string; email?: string | null }) {
  const [invitation, setInvitation] = useState<PortalInvitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const items = await api.get<PortalInvitation[]>(
        "/api/tenant/customer-portal/invitations?contactId=" + encodeURIComponent(contactId),
      )
      const latest = [...items].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0]
      setInvitation(latest ?? null)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo consultar el acceso")
    } finally {
      setLoading(false)
    }
  }, [contactId])

  useEffect(() => { void load() }, [load])

  const sendInvitation = async () => {
    setSaving(true)
    setMessage("")
    try {
      const pending = invitation?.status === "PENDING"
      const result = pending
        ? await api.post<{ invitation: PortalInvitation; emailSent: boolean }>(
            "/api/tenant/customer-portal/invitations/" + invitation.id + "/resend", {},
          )
        : await api.post<{ invitation: PortalInvitation; emailSent: boolean }>(
            "/api/tenant/customer-portal/invitations", { contactId },
          )
      setInvitation(result.invitation)
      setMessage(result.emailSent
        ? "Invitación enviada correctamente."
        : "La invitación quedó registrada, pero el correo no se pudo enviar. Revisa el proveedor de correo y vuelve a intentar.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo enviar la invitación")
    } finally {
      setSaving(false)
    }
  }

  const revoke = async () => {
    if (!invitation) return
    setSaving(true)
    setMessage("")
    try {
      await api.delete("/api/tenant/customer-portal/invitations/" + invitation.id)
      setInvitation({ ...invitation, status: "REVOKED" })
      setMessage("La invitación pendiente fue revocada.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo revocar la invitación")
    } finally {
      setSaving(false)
    }
  }

  const accepted = invitation?.status === "ACCEPTED"
  const pending = invitation?.status === "PENDING"

  return (
    <Card className="p-4 border border-border space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Acceso al portal de clientes</h3>
        <p className="text-xs text-muted-foreground mt-1">
          El cliente tendrá acceso únicamente a su propio perfil, cotizaciones y solicitudes de soporte.
        </p>
      </div>
      <div className="text-xs text-muted-foreground">
        Correo de acceso: <span className="font-medium text-foreground">{email || "No hay correo registrado"}</span>
      </div>
      {loading ? (
        <p className="text-xs text-muted-foreground">Consultando estado del acceso...</p>
      ) : accepted ? (
        <p className="text-xs text-emerald-500">El cliente ya activó su cuenta del portal.</p>
      ) : pending ? (
        <p className="text-xs text-amber-500">Invitación pendiente hasta {new Date(invitation.expiresAt).toLocaleString()}.</p>
      ) : invitation ? (
        <p className="text-xs text-muted-foreground">Última invitación: {invitation.status}.</p>
      ) : (
        <p className="text-xs text-muted-foreground">Este contacto aún no tiene acceso al portal.</p>
      )}
      {!accepted && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={loading || saving || !email} onClick={sendInvitation}>
            {saving ? "Procesando..." : pending ? "Reenviar invitación" : "Invitar al portal"}
          </Button>
          {pending && (
            <Button size="sm" variant="outline" disabled={saving} onClick={revoke}>
              Revocar invitación
            </Button>
          )}
        </div>
      )}
      {message && <p role="status" className="text-xs text-muted-foreground">{message}</p>}
    </Card>
  )
}
