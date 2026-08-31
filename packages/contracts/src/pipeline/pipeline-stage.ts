import { z } from 'zod'

export const PipelineStageSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  pipelineId: z.string().uuid(),
  name: z.string().min(1).max(100),
  probabilityPercent: z.number().int().min(0).max(100).default(0),
  displayOrder: z.number().int(),
  createdAt: z.string().datetime(),
})
export type PipelineStage = z.infer<typeof PipelineStageSchema>

export const CreateStageSchema = z.object({
  pipelineId: z.string().uuid(),
  name: z.string().min(1).max(100),
  probabilityPercent: z.number().int().min(0).max(100).default(0),
  displayOrder: z.number().int(),
})
export type CreateStage = z.infer<typeof CreateStageSchema>

export const ReorderStagesSchema = z.object({
  stageIds: z.array(z.string().uuid()),
})
export type ReorderStages = z.infer<typeof ReorderStagesSchema>
