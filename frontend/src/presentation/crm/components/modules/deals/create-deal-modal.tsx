"use client"

import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { FormInput, FormSelect } from "@/src/presentation/crm/components/ui/FormField"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { ApiDealRepository } from "@/src/infrastructure/crm/repositories/deals/api-deal.repository"
import type { PipelineStage } from "@/src/infrastructure/crm/repositories/pipelines/api-pipeline.repository"

const dealSchema = z.object({
  name: z.string().min(1, "Deal name is required").max(300),
  stageId: z.string().min(1, "Stage is required"),
  value: z.string().optional(),
  currency: z.enum(["USD", "EUR", "GBP"]),
  probability: z.string().optional(),
})

type DealFormData = z.infer<typeof dealSchema>

export interface CreateDealModalProps {
  pipelineId: string
  stages: PipelineStage[]
  onClose: () => void
  onSuccess: () => void
}

export function CreateDealModal({ pipelineId, stages, onClose, onSuccess }: CreateDealModalProps) {
  const { tenantId } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: { stageId: stages[0]?.id ?? "", currency: "USD" },
  })

  const mutation = useMutation({
    mutationFn: (data: DealFormData) =>
      ApiDealRepository.create({
        tenantId: tenantId!,
        pipelineId,
        stageId: data.stageId,
        name: data.name,
        value: data.value ? Number(data.value) : null,
        currency: data.currency,
        probability: data.probability ? Number(data.probability) : null,
      }),
    onSuccess,
  })

  return (
    <Modal open onClose={onClose} title="Create Deal">
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <FormInput
          label="Deal Name"
          registration={register("name")}
          error={errors.name}
          required
          placeholder="Enter deal name"
        />
        <FormSelect
          label="Stage"
          registration={register("stageId")}
          error={errors.stageId}
          required
        >
          {stages.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </FormSelect>
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Value"
            type="number"
            registration={register("value")}
            error={errors.value}
            placeholder="0.00"
          />
          <FormSelect
            label="Currency"
            registration={register("currency")}
            error={errors.currency}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </FormSelect>
        </div>
        <FormInput
          label="Probability (%)"
          type="number"
          registration={register("probability")}
          error={errors.probability}
          placeholder="50"
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
