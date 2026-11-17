"use client"

import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/src/presentation/crm/components/ui/Button"
import { Modal } from "@/src/presentation/crm/components/ui/Modal"
import { FormInput } from "@/src/presentation/crm/components/ui/FormField"
import { useAuth } from "@/src/presentation/hooks/use-auth"
import { ApiPipelineRepository } from "@/src/infrastructure/crm/repositories/pipelines/api-pipeline.repository"

const pipelineSchema = z.object({
  name: z.string().min(1, "Pipeline name is required").max(200),
  description: z.string().max(1000).optional().or(z.literal("")),
})

type PipelineFormData = z.infer<typeof pipelineSchema>

export interface CreatePipelineModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function CreatePipelineModal({ onClose, onSuccess }: CreatePipelineModalProps) {
  const { tenantId } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PipelineFormData>({
    resolver: zodResolver(pipelineSchema),
  })

  const mutation = useMutation({
    mutationFn: (data: PipelineFormData) =>
      ApiPipelineRepository.create({
        tenantId: tenantId!,
        name: data.name,
        description: data.description || null,
      }),
    onSuccess,
  })

  return (
    <Modal open onClose={onClose} title="Create Pipeline">
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <FormInput
          label="Pipeline Name"
          registration={register("name")}
          error={errors.name}
          required
          placeholder="e.g., Sales Pipeline"
        />
        <div className="space-y-2">
          <label className="text-caption text-ash font-medium">Description</label>
          <textarea
            className="h-20 w-full rounded-inputs bg-graphite px-3 py-2 text-sm text-foreground placeholder:text-ash rekki-inset focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            placeholder="Pipeline description"
            {...register("description")}
          />
          {errors.description && <p className="text-caption text-[#f87171]">{errors.description.message}</p>}
        </div>
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
