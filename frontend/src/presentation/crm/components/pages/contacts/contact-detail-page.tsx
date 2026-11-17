"use client"

import { useParams, useRouter } from "next/navigation"
import { Pencil, Trash2, Star, Phone, MessageSquare, Mail, MapPin, Globe, ExternalLink, Shield } from "lucide-react"
import { useState } from "react"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { EntityCard } from "@/src/presentation/crm/components/common/EntityCard"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { Avatar } from "@/src/presentation/crm/components/ui/Avatar"
import { ConfirmDialog } from "@/src/presentation/crm/components/common/ConfirmDialog"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useContact, useDeleteContact } from "@src/application/crm/di/hooks"
import { ClickToCallButton } from "@/src/presentation/crm/components/common/click-to-call-button"

export function ContactDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [showDelete, setShowDelete] = useState(false)
  const id = params.id as string

  const { data: contact, isLoading, isError, error } = useContact(id)
  const { mutate: deleteContact } = useDeleteContact()

  if (isError) return <ErrorState message={error?.message} />
  if (isLoading) return <Skeleton className="h-96" />
  if (!contact) return <div className="text-body text-ash">Contacto no encontrado</div>

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${contact.firstName} ${contact.lastName || ""}`}
        breadcrumb={[{ label: "Contactos", href: "/contacts" }, { label: `${contact.firstName} ${contact.lastName || ""}` }]}
        actions={
          <div className="flex items-center gap-2">
            <ClickToCallButton phoneNumber={contact.phone} contactName={`${contact.firstName} ${contact.lastName || ""}`} contactId={id} showText size="sm" />
            <Button variant="outline" onClick={() => router.push(`/contacts/${id}/360`)}>
              <Star className="h-4 w-4 mr-1.5 text-amber-500 fill-amber-500" /> Customer 360
            </Button>
            <Button variant="ghost" onClick={() => router.push(`/contacts/${id}/edit`)}>
              <Pencil className="h-4 w-4 mr-1" /> Editar
            </Button>
            <Button variant="danger" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-4 w-4 mr-1" /> Eliminar
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border">
        <Avatar name={`${contact.firstName} ${contact.lastName || ""}`} size="lg" />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-foreground">{contact.firstName} {contact.lastName || ""}</h2>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              contact.leadStatus === "CUSTOMER" ? "bg-emerald-500/10 text-emerald-400" :
              contact.leadStatus === "QUALIFIED" ? "bg-cyan-500/10 text-cyan-400" : "bg-slate-800 text-slate-300"
            }`}>
              {contact.leadStatus || "NEW"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{contact.jobTitle ?? "Sin Cargo"} • {contact.email || "Sin email"}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Lead Score</p>
          <p className="text-xl font-bold font-mono text-cyan-400">{contact.leadScore ?? 50} pts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <EntityCard title="Canales de Comunicación Directa & Omnicanal">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-caption text-muted-foreground">Teléfono Principal</p>
                <p className="text-body font-mono text-foreground">{contact.phone ?? "—"}</p>
              </div>
              <div>
                <p className="text-caption text-muted-foreground">WhatsApp Cloud API (E.164)</p>
                <p className="text-body font-mono text-emerald-400 font-semibold">{contact.whatsappNumber ?? "—"}</p>
              </div>
              <div>
                <p className="text-caption text-muted-foreground">Correo Electrónico</p>
                <p className="text-body text-foreground">{contact.email ?? "—"}</p>
              </div>
              <div>
                <p className="text-caption text-muted-foreground">Perfil de LinkedIn</p>
                {contact.linkedinUrl ? <a href={contact.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-sm font-medium flex items-center gap-1"><ExternalLink className="h-3.5 w-3.5" /> Ver LinkedIn</a> : <p className="text-body text-foreground">—</p>}
              </div>
            </div>
          </EntityCard>

          <EntityCard title="Ubicación & Configuración Regional">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-caption text-muted-foreground">Ciudad / País</p>
                <p className="text-body text-foreground">{[contact.city, contact.country].filter(Boolean).join(", ") || "Global"}</p>
              </div>
              <div>
                <p className="text-caption text-muted-foreground">Dirección</p>
                <p className="text-body text-foreground">{contact.streetAddress ?? "—"}</p>
              </div>
              <div>
                <p className="text-caption text-muted-foreground">Zona Horaria</p>
                <p className="text-body font-mono text-slate-300">{contact.timezone ?? "America/Bogota"}</p>
              </div>
              <div>
                <p className="text-caption text-muted-foreground">Idioma Preferido</p>
                <p className="text-body font-semibold text-cyan-400">{contact.preferredLanguage ?? "ES"}</p>
              </div>
            </div>
          </EntityCard>
        </div>

        <div className="space-y-6">
          <Card className="p-4 bg-card border border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3">Datos Comerciales & Calificación</h3>
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-muted-foreground">Fuente del Lead</p>
                <p className="font-semibold text-foreground">{contact.leadSource ?? "Inbound Web"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Puntos de Fidelización</p>
                <p className="font-bold font-mono text-amber-400">{contact.loyaltyPoints ?? 0} pts</p>
              </div>
              <div>
                <p className="text-muted-foreground">Frecuencia de Contacto</p>
                <p className="text-foreground">{contact.stayInTouchFrequencyDays ? `Cada ${contact.stayInTouchFrequencyDays} días` : "No programado"}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Metadatos del Registro</h3>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Fecha Creación: {new Date(contact.createdAt).toLocaleDateString()}</p>
              <p>Última Actualización: {new Date(contact.updatedAt).toLocaleDateString()}</p>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Eliminar contacto"
        message={`¿Estás seguro de eliminar a "${contact.firstName} ${contact.lastName || ""}"?`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={() => { deleteContact(id); router.push("/contacts") }}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
export default ContactDetailPage
