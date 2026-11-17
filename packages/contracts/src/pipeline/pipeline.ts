import { z } from 'zod'

export const PipelineSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(100),
  createdAt: z.string().datetime(),
})
export type Pipeline = z.infer<typeof PipelineSchema>

export const CreatePipelineSchema = z.object({
  name: z.string().min(1).max(100),
})
export type CreatePipeline = z.infer<typeof CreatePipelineSchema>
