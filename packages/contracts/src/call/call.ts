import { z } from 'zod'

export const CallSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  contactId: z.string().uuid().nullable(),
  callType: z.enum(['INBOUND', 'OUTBOUND', 'MEETING']).default('OUTBOUND'),
  durationSeconds: z.number().int().nullable(),
  summary: z.string().nullable(),
  happenedAt: z.string().datetime(),
  authorUserId: z.string().uuid(),
  createdAt: z.string().datetime(),
})
export type Call = z.infer<typeof CallSchema>

export const CreateCallSchema = z.object({
  contactId: z.string().uuid().nullable().optional(),
  callType: z.enum(['INBOUND', 'OUTBOUND', 'MEETING']).default('OUTBOUND'),
  durationSeconds: z.number().int().nullable().optional(),
  summary: z.string().nullable().optional(),
  happenedAt: z.string(),
  authorUserId: z.string().uuid().nullable().optional(),
})
export type CreateCall = z.infer<typeof CreateCallSchema>
