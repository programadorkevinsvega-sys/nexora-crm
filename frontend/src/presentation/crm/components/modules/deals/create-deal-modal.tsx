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
  name: z.string().min(1, "El nombre de la oportunidad es requerido").max(300),
  stageId: z.string().min(1, "La etapa es requerida"),
  amount: z.coerce.number().min(0).default(0),
  currency: z.enum(["USD", "COP", "MXN", "EUR"]).default("USD"),
  probabilityOverride: z.coerce.number().int().min(0).max(100).optional().nullable(),
  forecastCategory: z.enum(["PIPELINE", "BEST_CASE", "COMMIT", "CLOSED"]).default("PIPELINE"),
  expectedCloseDate: z.string().optional().or(z.literal("")),
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

  const { register, handleSubmit, formState: { errors } } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      stageId: stages[0]?.id ?? "",
      currency: "USD",
      forecastCategory: "PIPELINE",
      amount: 0,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: DealFormData) =>
      ApiDealRepository.create({
        tenantId: tenantId!,
        pipelineId,
        stageId: data.stageId,
        name: data.name,
        amount: data.amount,
        currency: data.currency,
        probabilityOverride: data.probabilityOverride ?? undefined,
        forecastCategory: data.forecastCategory,
        expectedCloseDate: data.expectedCloseDate || undefined,
      }),
    onSuccess,
  })

  return (
    <Modal open onClose={onClose} title="Crear Oportunidad (Deal Enterprise)">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        <FormInput label="Título de la Oportunidad *" registration={register("name")} error={errors.name} required placeholder="ej. Contrato SaaS Anual 2026" />
        
        <div className="grid grid-cols-2 gap-4">
          <FormSelect label="Etapa del Pipeline *" registration={register("stageId")} error={errors.stageId} required>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.probabilityPercent}%)</option>
            ))}
          </FormSelect>
          <FormSelect
            label="Categoría de Forecasting"
            registration={register("forecastCategory")}
            options={[
              { label: "Pipeline (Abierto)", value: "PIPELINE" },
              { label: "Best Case (Probable)", value: "BEST_CASE" },
              { label: "Commit (Comprometido)", value: "COMMIT" },
              { label: "Closed (Cerrado Ganado)", value: "CLOSED" },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Monto Estimado" type="number" registration={register("amount")} error={errors.amount} placeholder="50000" />
          <FormSelect
            label="Moneda"
            registration={register("currency")}
            options={[
              { label: "USD ($) — Dólar Estadounidense", value: "USD" },
              { label: "COP ($) — Peso Colombiano", value: "COP" },
              { label: "MXN ($) — Peso Mexicano", value: "MXN" },
              { label: "EUR (€) — Euro", value: "EUR" },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Probabilidad Manual (%)" type="number" registration={register("probabilityOverride")} error={errors.probabilityOverride} placeholder="ej. 75" />
          <FormInput label="Fecha Estimada de Cierre" type="date" registration={register("expectedCloseDate")} error={errors.expectedCloseDate} />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-muted/30">
          <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Guardando..." : "Crear Oportunidad"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
