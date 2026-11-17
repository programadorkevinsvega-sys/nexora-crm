import { z } from 'zod'

export const CallSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  contactId: z.string().uuid().nullable().optional(),
  companyId: z.string().uuid().nullable().optional(),
  dealId: z.string().uuid().nullable().optional(),
  callType: z.enum(['INBOUND', 'OUTBOUND', 'MEETING']).default('OUTBOUND'),
  phoneNumber: z.string().nullable().optional(),
  durationSeconds: z.number().int().nullable().optional(),
  callSid: z.string().nullable().optional(),
  recordingUrl: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  aiSummary: z.string().nullable().optional(),
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).nullable().optional(),
  happenedAt: z.string().datetime(),
  authorUserId: z.string().uuid(),
  createdAt: z.string().datetime(),
})
export type Call = z.infer<typeof CallSchema>

export const CreateCallSchema = z.object({
  contactId: z.string().uuid().nullable().optional(),
  companyId: z.string().uuid().nullable().optional(),
  dealId: z.string().uuid().nullable().optional(),
  callType: z.enum(['INBOUND', 'OUTBOUND', 'MEETING']).default('OUTBOUND'),
  phoneNumber: z.string().nullable().optional(),
  durationSeconds: z.number().int().nullable().optional(),
  callSid: z.string().nullable().optional(),
  recordingUrl: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  aiSummary: z.string().nullable().optional(),
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).nullable().optional(),
  happenedAt: z.string(),
  authorUserId: z.string().uuid().nullable().optional(),
})
export type CreateCall = z.infer<typeof CreateCallSchema>
