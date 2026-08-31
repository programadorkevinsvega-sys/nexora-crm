"use client"

import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { FormInput } from "@/src/presentation/crm/components/ui/FormField"
import { ApiPipelineRepository } from "@/src/infrastructure/crm/repositories/pipelines/api-pipeline.repository"

const stageSchema = z.object({
  name: z.string().min(1, "Stage name is required").max(100),
  probability: z.string().optional(),
})

type StageFormData = z.infer<typeof stageSchema>

export interface CreateStageModalProps {
  pipelineId: string
  onClose: () => void
  onSuccess: () => void
}

export function CreateStageModal({ pipelineId, onClose, onSuccess }: CreateStageModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StageFormData>({
    resolver: zodResolver(stageSchema),
    defaultValues: { probability: "" },
  })

  const mutation = useMutation({
    mutationFn: (data: StageFormData) =>
      ApiPipelineRepository.createStage(pipelineId, {
        name: data.name,
        probability: data.probability ? Number(data.probability) : null,
      }),
    onSuccess,
  })

  return (
    <Modal open onClose={onClose} title="Create Stage">
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <FormInput
          label="Stage Name"
          registration={register("name")}
          error={errors.name}
          required
          placeholder="e.g., Qualified"
        />
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
