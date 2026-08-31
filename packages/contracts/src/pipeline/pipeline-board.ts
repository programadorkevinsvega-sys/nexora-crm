import { z } from 'zod'
import { DealSchema } from './deal'

export const PipelineBoardSchema = z.object({
  pipeline: z.object({ id: z.string().uuid(), name: z.string() }),
  stages: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    probabilityPercent: z.number(),
    displayOrder: z.number(),
    deals: z.array(DealSchema),
  })),
})
export type PipelineBoard = z.infer<typeof PipelineBoardSchema>
