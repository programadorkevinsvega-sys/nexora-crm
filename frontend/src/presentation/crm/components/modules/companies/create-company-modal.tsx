"use client"

import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { FormInput, FormSelect } from "@/src/presentation/crm/components/ui/FormField"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { ApiCompanyRepository } from "@/src/infrastructure/crm/repositories/companies/api-company.repository"

const companySchema = z.object({
  name: z.string().min(1, "Company name is required").max(200),
  industry: z.string().max(200).optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  taxId: z.string().max(100).optional().or(z.literal("")),
  numberOfEmployees: z.coerce.number().int().nonnegative().optional().or(z.literal("")).nullable(),
  annualRevenue: z.coerce.number().nonnegative().optional().or(z.literal("")).nullable(),
  linkedinUrl: z.string().optional().or(z.literal("")),
  lifecycleStage: z.enum(["LEAD", "PROSPECT", "CUSTOMER", "CHURNED", "PARTNER"]).default("PROSPECT"),
  tier: z.enum(["TIER_1_VIP", "TIER_2", "TIER_3"]).default("TIER_2"),
  healthScore: z.coerce.number().int().min(0).max(100).default(100),
  description: z.string().optional().or(z.literal("")),
})

type CompanyFormData = z.infer<typeof companySchema>

export interface CreateCompanyModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function CreateCompanyModal({ onClose, onSuccess }: CreateCompanyModalProps) {
  const { tenantId } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof companySchema>, unknown, CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      industry: "",
      website: "",
      phone: "",
      email: "",
      country: "Colombia",
      city: "Bogotá",
      address: "",
      taxId: "",
      numberOfEmployees: null,
      annualRevenue: null,
      linkedinUrl: "",
      lifecycleStage: "PROSPECT",
      tier: "TIER_2",
      healthScore: 100,
      description: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: CompanyFormData) =>
      ApiCompanyRepository.create({
        tenantId: tenantId!,
        name: data.name,
        industry: data.industry || null,
        website: data.website || null,
        phone: data.phone || null,
        email: data.email || null,
        country: data.country || null,
        city: data.city || null,
        address: data.address || null,
        taxId: data.taxId || null,
        numberOfEmployees: typeof data.numberOfEmployees === "number" ? data.numberOfEmployees : null,
        annualRevenue: typeof data.annualRevenue === "number" ? data.annualRevenue : null,
        linkedinUrl: data.linkedinUrl || null,
        lifecycleStage: data.lifecycleStage,
        tier: data.tier,
        healthScore: data.healthScore,
        description: data.description || null,
      }),
    onSuccess,
  })

  return (
    <Modal open onClose={onClose} title="Crear Empresa Enterprise">
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        <FormInput label="Razón Social / Nombre *" registration={register("name")} error={errors.name} required placeholder="Nombre de la empresa" />
        
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Tax ID (NIT / RUT / CIF)" registration={register("taxId")} error={errors.taxId} placeholder="e.g., 900.123.456-7" />
          <FormInput label="Industria / Sector" registration={register("industry")} error={errors.industry} placeholder="e.g., Tecnología, Finanzas" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Email Corporativo" type="email" registration={register("email")} error={errors.email} placeholder="contacto@empresa.com" />
          <FormInput label="Teléfono PBX" registration={register("phone")} error={errors.phone} placeholder="+57 601 3456789" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput label="País" registration={register("country")} error={errors.country} placeholder="Colombia" />
          <FormInput label="Ciudad" registration={register("city")} error={errors.city} placeholder="Bogotá" />
        </div>
        <FormInput label="Dirección Principal" registration={register("address")} error={errors.address} placeholder="Cra 7 # 71-21 Torre A" />

        <div className="grid grid-cols-3 gap-3">
          <FormSelect
            label="Etapa de Cliente"
            registration={register("lifecycleStage")}
            options={[
              { label: "Prospecto (Prospect)", value: "PROSPECT" },
              { label: "Lead Calificado", value: "LEAD" },
              { label: "Cliente Activo", value: "CUSTOMER" },
              { label: "Partner / Canal", value: "PARTNER" },
              { label: "Inactivo / Churned", value: "CHURNED" },
            ]}
          />
          <FormSelect
            label="Nivel / Tier VIP"
            registration={register("tier")}
            options={[
              { label: "Tier 1 — VIP Strategic", value: "TIER_1_VIP" },
              { label: "Tier 2 — Mid-Market", value: "TIER_2" },
              { label: "Tier 3 — Standard SMB", value: "TIER_3" },
            ]}
          />
          <FormInput label="Health Score (0-100)" type="number" registration={register("healthScore")} error={errors.healthScore} placeholder="100" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Sitio Web" registration={register("website")} error={errors.website} placeholder="https://empresa.com" />
          <FormInput label="LinkedIn URL" registration={register("linkedinUrl")} error={errors.linkedinUrl} placeholder="https://linkedin.com/company/..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Número de Empleados" type="number" registration={register("numberOfEmployees")} error={errors.numberOfEmployees} placeholder="50" />
          <FormInput label="Facturación Anual ($USD)" type="number" registration={register("annualRevenue")} error={errors.annualRevenue} placeholder="500000" />
        </div>

        <FormInput label="Notas y Descripción" registration={register("description")} error={errors.description} placeholder="Detalles estratégicos de la cuenta..." />

        <div className="flex justify-end gap-3 pt-3 border-t border-muted/30">
          <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Guardando..." : "Guardar Empresa"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
