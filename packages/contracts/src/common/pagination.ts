import { z } from 'zod'

export const TenantId = z.string().uuid()
export type TenantId = z.infer<typeof TenantId>

export const CursorParams = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
export type CursorParams = z.infer<typeof CursorParams>

export const PaginatedResponse = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    nextCursor: z.string().nullable(),
  })
