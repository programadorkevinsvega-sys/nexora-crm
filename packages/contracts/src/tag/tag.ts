import { z } from 'zod'

export const TagSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(50),
  color: z.string().max(20).default('#E2E8F0'),
  createdAt: z.string().datetime(),
})
export type Tag = z.infer<typeof TagSchema>

export const CreateTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().max(20).default('#E2E8F0'),
})
export type CreateTag = z.infer<typeof CreateTagSchema>
