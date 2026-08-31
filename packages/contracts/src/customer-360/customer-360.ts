import { z } from 'zod'

export const TimelineItemTypeSchema = z.enum([
  'NOTE',
  'CALL',
  'TASK',
  'MEETING',
  'EMAIL',
  'WHATSAPP',
  'SMS',
  'DEAL',
  'QUOTE',
  'CONTRACT',
  'TICKET',
  'SCORE_EVENT',
])
export type TimelineItemType = z.infer<typeof TimelineItemTypeSchema>

export const CustomerTimelineItemSchema = z.object({
  id: z.string(),
  type: TimelineItemTypeSchema,
  title: z.string(),
  description: z.string().nullable().optional(),
  timestamp: z.string(),
  author: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  metadata: z.record(z.any()).optional(),
})
export type CustomerTimelineItem = z.infer<typeof CustomerTimelineItemSchema>

export const Customer360MetricsSchema = z.object({
  ltv: z.number().nonnegative().default(0),
  mrr: z.number().nonnegative().default(0),
  activePipelineValue: z.number().nonnegative().default(0),
  loyaltyPoints: z.number().int().nonnegative().default(0),
  leadScore: z.number().int().default(0),
  leadTemperature: z.enum(['COLD', 'WARM', 'HOT']).default('COLD'),
  openTicketsCount: z.number().int().nonnegative().default(0),
  activeContractsCount: z.number().int().nonnegative().default(0),
  totalDealsCount: z.number().int().nonnegative().default(0),
})
export type Customer360Metrics = z.infer<typeof Customer360MetricsSchema>

export const Customer360ProfileSchema = z.object({
  contactId: z.string().uuid(),
  tenantId: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  jobTitle: z.string().nullable().optional(),
  companyName: z.string().nullable().optional(),
  companyId: z.string().uuid().nullable().optional(),
  metrics: Customer360MetricsSchema,
  timeline: z.array(CustomerTimelineItemSchema).default([]),
})
export type Customer360Profile = z.infer<typeof Customer360ProfileSchema>
