"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { FormInput, FormSelect } from "@/src/presentation/crm/components/ui/FormField"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useContact, useUpdateContact } from "@src/application/crm/di/hooks"

const contactSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido").max(100),
  lastName: z.string().max(100).optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  whatsappNumber: z.string().max(50).optional().or(z.literal("")),
  linkedinUrl: z.string().optional().or(z.literal("")),
  jobTitle: z.string().max(200).optional().or(z.literal("")),
  timezone: z.string().default("America/Bogota"),
  preferredLanguage: z.enum(["ES", "EN", "PT"]).default("ES"),
  leadStatus: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CUSTOMER", "CHURNED"]).default("NEW"),
  leadScore: z.coerce.number().int().min(0).max(100).default(50),
  leadSource: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
})

type ContactFormData = z.infer<typeof contactSchema>

export function EditContactPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: contact, isLoading, isError, error } = useContact(id)
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<
    z.input<typeof contactSchema>,
    unknown,
    ContactFormData
  >({
    resolver: zodResolver(contactSchema),
  })

  useEffect(() => {
    if (contact) {
      setValue("firstName", contact.firstName)
      setValue("lastName", contact.lastName ?? "")
      setValue("email", contact.email ?? "")
      setValue("phone", contact.phone ?? "")
      setValue("whatsappNumber", contact.whatsappNumber ?? "")
      setValue("linkedinUrl", contact.linkedinUrl ?? "")
      setValue("jobTitle", contact.jobTitle ?? "")
      setValue("timezone", contact.timezone ?? "America/Bogota")
      setValue("preferredLanguage", (contact.preferredLanguage as any) ?? "ES")
      setValue("leadStatus", (contact.leadStatus as any) ?? "NEW")
      setValue("leadScore", contact.leadScore ?? 50)
      setValue("leadSource", contact.leadSource ?? "")
      setValue("city", contact.city ?? "")
      setValue("country", contact.country ?? "")
    }
  }, [contact, setValue])

  const { mutate: updateContact, isPending } = useUpdateContact()

  if (isError) return <ErrorState message={error?.message} />
  if (isLoading) return <Skeleton className="h-96" />
  if (!contact) return <div className="text-body text-ash">Contacto no encontrado</div>

  const onSubmit = (data: ContactFormData) => {
    updateContact(
      {
        id,
        data: {
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
        },
      },
      { onSuccess: () => router.push(`/contacts/${id}`) }
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Editar Contacto Enterprise"
        breadcrumb={[{ label: "Contactos", href: "/contacts" }, { label: `${contact.firstName} ${contact.lastName || ""}`, href: `/contacts/${id}` }, { label: "Editar" }]}
      />

      <Card className="p-6 bg-card border border-border">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Nombre *" registration={register("firstName")} error={errors.firstName} required />
            <FormInput label="Apellido" registration={register("lastName")} error={errors.lastName} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Email Profesional" type="email" registration={register("email")} error={errors.email} />
            <FormInput label="Cargo / Rol" registration={register("jobTitle")} error={errors.jobTitle} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Teléfono Directo" registration={register("phone")} error={errors.phone} />
            <FormInput label="WhatsApp (Cloud API E.164)" registration={register("whatsappNumber")} error={errors.whatsappNumber} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormSelect label="Estado del Lead" registration={register("leadStatus")} options={[
              { label: "Nuevo (New)", value: "NEW" },
              { label: "Contactado", value: "CONTACTED" },
              { label: "Calificado (BANT)", value: "QUALIFIED" },
              { label: "Cliente Activo", value: "CUSTOMER" },
              { label: "Perdido / Churned", value: "CHURNED" },
            ]} />
            <FormInput label="Lead Score (0-100)" type="number" registration={register("leadScore")} error={errors.leadScore} />
            <FormSelect label="Idioma Preferido" registration={register("preferredLanguage")} options={[
              { label: "Español (ES)", value: "ES" },
              { label: "Inglés (EN)", value: "EN" },
              { label: "Portugués (PT)", value: "PT" },
            ]} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput label="LinkedIn URL" registration={register("linkedinUrl")} error={errors.linkedinUrl} />
            <FormInput label="Fuente del Lead" registration={register("leadSource")} error={errors.leadSource} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Ciudad" registration={register("city")} error={errors.city} />
            <FormInput label="País" registration={register("country")} error={errors.country} />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button variant="ghost" type="button" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" disabled={isPending} className="bg-cyan-600 hover:bg-cyan-500 text-white">
              {isPending ? "Guardando..." : "Actualizar Contacto"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
export default EditContactPage
