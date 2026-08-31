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
  taxId: z.string().max(100).optional().or(z.literal("")),
  numberOfEmployees: z.coerce.number().int().nonnegative().optional().or(z.literal("")).nullable(),
  annualRevenue: z.coerce.number().nonnegative().optional().or(z.literal("")).nullable(),
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
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: { name: "", industry: "", website: "", taxId: "", numberOfEmployees: null, annualRevenue: null, description: "" },
  })

  const mutation = useMutation({
    mutationFn: (data: CompanyFormData) =>
      ApiCompanyRepository.create({
        tenantId: tenantId!,
        name: data.name,
        industry: data.industry || null,
        website: data.website || null,
        taxId: data.taxId || null,
        numberOfEmployees: typeof data.numberOfEmployees === "number" ? data.numberOfEmployees : null,
        annualRevenue: typeof data.annualRevenue === "number" ? data.annualRevenue : null,
        description: data.description || null,
      }),
    onSuccess,
  })

  return (
    <Modal open onClose={onClose} title="Create Company">
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <FormInput
          label="Company Name"
          registration={register("name")}
          error={errors.name}
          required
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
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
