"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { FormInput } from "@/src/presentation/crm/components/ui/FormField"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { ErrorState } from "@/src/presentation/components/error-state"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { useCompany, useUpdateCompany } from "@src/application/crm/di/hooks"

const companySchema = z.object({
  name: z.string().min(1, "Company name is required").max(200),
  industry: z.string().max(200).optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  taxId: z.string().max(100).optional().or(z.literal("")),
  numberOfEmployees: z.coerce.number().int().nonnegative().optional().or(z.literal("")).nullable(),
  annualRevenue: z.coerce.number().nonnegative().optional().or(z.literal("")).nullable(),
  description: z.string().optional().or(z.literal("")),
})

type CompanyFormData = z.infer<typeof companySchema>

export function EditCompanyPage() {
  const params = useParams()
  const router = useRouter()
  const { tenantId } = useAuth()
  const id = params.id as string

  const { data: company, isLoading, isError, error } = useCompany(id)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: { name: "", industry: "", website: "", taxId: "", numberOfEmployees: null, annualRevenue: null, description: "" },
  })

  useEffect(() => {
    if (company) {
      setValue("name", company.name)
      setValue("industry", company.industry ?? "")
      setValue("website", company.website ?? "")
      setValue("taxId", company.taxId ?? "")
      setValue("numberOfEmployees", company.numberOfEmployees ?? null)
      setValue("annualRevenue", company.annualRevenue != null ? Number(company.annualRevenue) : null)
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
          taxId: data.taxId || null,
          numberOfEmployees: typeof data.numberOfEmployees === "number" ? data.numberOfEmployees : null,
          annualRevenue: typeof data.annualRevenue === "number" ? data.annualRevenue : null,
          description: data.description || null,
        },
      },
      {
        onSuccess: () => router.push(`/crm/companies/${id}`),
      }
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Edit Company"
        breadcrumb={[
          { label: "Companies", href: "/crm/companies" },
          { label: company.name, href: `/crm/companies/${id}` },
          { label: "Edit" },
        ]}
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            label="Company Name *"
            registration={register("name")}
            error={errors.name}
            placeholder="Company name"
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Tax ID (NIT / RUT)"
              registration={register("taxId")}
              error={errors.taxId}
              placeholder="e.g., 900.123.456-7"
            />
            <FormInput
              label="Industry"
              registration={register("industry")}
              error={errors.industry}
              placeholder="e.g., Technology"
            />
          </div>
          <FormInput
            label="Website"
            registration={register("website")}
            error={errors.website}
            placeholder="https://example.com"
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Employees Count"
              type="number"
              registration={register("numberOfEmployees")}
              error={errors.numberOfEmployees}
              placeholder="e.g., 50"
            />
            <FormInput
              label="Annual Revenue"
              type="number"
              registration={register("annualRevenue")}
              error={errors.annualRevenue}
              placeholder="e.g., 500000"
            />
          </div>
          <FormInput
            label="Description"
            registration={register("description")}
            error={errors.description}
            placeholder="Write a brief description..."
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
export default EditCompanyPage
