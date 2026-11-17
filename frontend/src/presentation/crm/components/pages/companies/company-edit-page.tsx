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
import { useCompany, useUpdateCompany } from "@src/application/crm/di/hooks"

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

export function EditCompanyPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: company, isLoading, isError, error } = useCompany(id)
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  })

  useEffect(() => {
    if (company) {
      setValue("name", company.name)
      setValue("industry", company.industry ?? "")
      setValue("website", company.website ?? "")
      setValue("phone", company.phone ?? "")
      setValue("email", company.email ?? "")
      setValue("country", company.country ?? "Colombia")
      setValue("city", company.city ?? "Bogotá")
      setValue("address", company.address ?? "")
      setValue("taxId", company.taxId ?? "")
      setValue("numberOfEmployees", company.numberOfEmployees ?? null)
      setValue("annualRevenue", company.annualRevenue != null ? Number(company.annualRevenue) : null)
      setValue("linkedinUrl", company.linkedinUrl ?? "")
      setValue("lifecycleStage", (company.lifecycleStage as any) ?? "PROSPECT")
      setValue("tier", (company.tier as any) ?? "TIER_2")
      setValue("healthScore", company.healthScore ?? 100)
      setValue("description", company.description ?? "")
    }
  }, [company, setValue])

  const { mutate: updateCompany, isPending } = useUpdateCompany()

  if (isError) return <ErrorState message={error?.message} />
  if (isLoading) return <Skeleton className="h-96" />
  if (!company) return <div className="text-body text-ash">Company not found</div>

  const onSubmit = (data: CompanyFormData) => {
    updateCompany(
      {
        id,
        data: {
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
        },
      },
      { onSuccess: () => router.push(`/companies/${id}`) }
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Editar Cuenta Corporativa"
        breadcrumb={[{ label: "Empresas", href: "/companies" }, { label: company.name, href: `/companies/${id}` }, { label: "Editar" }]}
      />

      <Card className="p-6 bg-card border border-border">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput label="Razón Social *" registration={register("name")} error={errors.name} required />
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Tax ID (NIT / RUT)" registration={register("taxId")} error={errors.taxId} />
            <FormInput label="Industria" registration={register("industry")} error={errors.industry} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Email Corporativo" type="email" registration={register("email")} error={errors.email} />
            <FormInput label="Teléfono PBX" registration={register("phone")} error={errors.phone} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="País" registration={register("country")} error={errors.country} />
            <FormInput label="Ciudad" registration={register("city")} error={errors.city} />
          </div>
          <FormInput label="Dirección Principal" registration={register("address")} error={errors.address} />

          <div className="grid grid-cols-3 gap-3">
            <FormSelect label="Etapa del Cliente" registration={register("lifecycleStage")} options={[
              { label: "Prospecto", value: "PROSPECT" },
              { label: "Lead Calificado", value: "LEAD" },
              { label: "Cliente Activo", value: "CUSTOMER" },
              { label: "Partner", value: "PARTNER" },
              { label: "Churned", value: "CHURNED" },
            ]} />
            <FormSelect label="Nivel / Tier VIP" registration={register("tier")} options={[
              { label: "Tier 1 — VIP", value: "TIER_1_VIP" },
              { label: "Tier 2 — Standard", value: "TIER_2" },
              { label: "Tier 3 — SMB", value: "TIER_3" },
            ]} />
            <FormInput label="Health Score" type="number" registration={register("healthScore")} error={errors.healthScore} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Sitio Web" registration={register("website")} error={errors.website} />
            <FormInput label="LinkedIn URL" registration={register("linkedinUrl")} error={errors.linkedinUrl} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Empleados" type="number" registration={register("numberOfEmployees")} error={errors.numberOfEmployees} />
            <FormInput label="Facturación Anual ($USD)" type="number" registration={register("annualRevenue")} error={errors.annualRevenue} />
          </div>

          <FormInput label="Descripción" registration={register("description")} error={errors.description} />

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button variant="ghost" type="button" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" disabled={isPending} className="bg-cyan-600 hover:bg-cyan-500 text-white">
              {isPending ? "Guardando..." : "Actualizar Empresa"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
export default EditCompanyPage
