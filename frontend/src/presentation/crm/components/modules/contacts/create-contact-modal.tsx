"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { FormInput, FormSelect } from "@/src/presentation/crm/components/ui/FormField"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { ApiContactRepository } from "@/src/infrastructure/crm/repositories/contacts/api-contact.repository"

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().max(100).optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  whatsappNumber: z.string().max(50).optional().or(z.literal("")),
  linkedinUrl: z.string().optional().or(z.literal("")),
  jobTitle: z.string().max(200).optional().or(z.literal("")),
  timezone: z.string().default("America/Bogota"),
  preferredLanguage: z.enum(["ES", "EN", "PT"]).default("ES"),
  leadStatus: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CUSTOMER", "CHURNED"]).default("NEW"),
  leadScore: z.coerce.number().int().min(0).max(100).default(0),
  leadSource: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  taxRegime: z.string().optional().or(z.literal("")),
  identificationNumber: z.string().optional().or(z.literal("")),
})

type ContactFormData = z.infer<typeof contactSchema>

export function CreateContactModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { tenantId } = useAuth()
  const [showAdvanced, setShowAdvanced] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<
    z.input<typeof contactSchema>,
    unknown,
    ContactFormData
  >({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      whatsappNumber: "",
      linkedinUrl: "",
      jobTitle: "",
      timezone: "America/Bogota",
      preferredLanguage: "ES",
      leadStatus: "NEW",
      leadScore: 50,
      leadSource: "Web Inbound",
      city: "Bogotá",
      country: "Colombia",
      taxRegime: "Régimen Común",
      identificationNumber: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: ContactFormData) =>
      ApiContactRepository.create({
        tenantId: tenantId!,
        firstName: data.firstName,
        lastName: data.lastName || null,
        email: data.email || null,
        phone: data.phone || null,
        whatsappNumber: data.whatsappNumber || null,
        linkedinUrl: data.linkedinUrl || null,
        jobTitle: data.jobTitle || null,
        timezone: data.timezone,
        preferredLanguage: data.preferredLanguage,
        leadStatus: data.leadStatus,
        leadScore: data.leadScore,
        leadSource: data.leadSource || null,
        city: data.city || null,
        country: data.country || null,
        taxRegime: data.taxRegime || null,
        identificationNumber: data.identificationNumber || null,
      }),
    onSuccess,
  })

  return (
    <Modal open onClose={onClose} title="Crear Contacto Enterprise">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Nombre *" registration={register("firstName")} error={errors.firstName} required placeholder="Juan" />
          <FormInput label="Apellido" registration={register("lastName")} error={errors.lastName} placeholder="Gómez" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Email Profesional" type="email" registration={register("email")} error={errors.email} placeholder="juan.gomez@empresa.com" />
          <FormInput label="Cargo / Rol" registration={register("jobTitle")} error={errors.jobTitle} placeholder="Director de Operaciones" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Teléfono Directo" registration={register("phone")} error={errors.phone} placeholder="+57 300 1234567" />
          <FormInput label="WhatsApp (Cloud API E.164)" registration={register("whatsappNumber")} error={errors.whatsappNumber} placeholder="+573001234567" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <FormSelect
            label="Estado del Lead"
            registration={register("leadStatus")}
            options={[
              { label: "Nuevo (New)", value: "NEW" },
              { label: "Contactado", value: "CONTACTED" },
              { label: "Calificado (BANT)", value: "QUALIFIED" },
              { label: "Cliente Activo", value: "CUSTOMER" },
              { label: "Perdido / Churned", value: "CHURNED" },
            ]}
          />
          <FormInput label="Lead Score (0-100)" type="number" registration={register("leadScore")} error={errors.leadScore} placeholder="50" />
          <FormSelect
            label="Idioma Preferido"
            registration={register("preferredLanguage")}
            options={[
              { label: "Español (ES)", value: "ES" },
              { label: "Inglés (EN)", value: "EN" },
              { label: "Portugués (PT)", value: "PT" },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput label="LinkedIn URL" registration={register("linkedinUrl")} error={errors.linkedinUrl} placeholder="https://linkedin.com/in/..." />
          <FormInput label="Fuente del Lead" registration={register("leadSource")} error={errors.leadSource} placeholder="LinkedIn Ads, Web, Referral" />
        </div>

        <div className="pt-1">
          <button type="button" className="text-xs font-semibold text-cyan-400 hover:underline" onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? "▲ Ocultar Ubicación & Fiscal" : "▼ Mostrar Ubicación & Datos Fiscales"}
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-3 border-t border-muted/30 pt-3">
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Ciudad" registration={register("city")} error={errors.city} placeholder="Bogotá" />
              <FormInput label="País" registration={register("country")} error={errors.country} placeholder="Colombia" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Cédula / Documento ID" registration={register("identificationNumber")} error={errors.identificationNumber} placeholder="1020304050" />
              <FormInput label="Régimen Fiscal" registration={register("taxRegime")} error={errors.taxRegime} placeholder="Régimen Común" />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-muted/30">
          <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Guardando..." : "Guardar Contacto"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
