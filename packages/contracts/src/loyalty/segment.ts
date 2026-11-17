import { z } from 'zod'

export const CustomerSegmentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().nullable(),
  isDynamic: z.boolean().default(false),
  rulesJson: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type CustomerSegment = z.infer<typeof CustomerSegmentSchema>

export const CreateSegmentSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  isDynamic: z.boolean().nullable().optional(),
  rulesJson: z.string().nullable().optional(),
})
export type CreateSegment = z.infer<typeof CreateSegmentSchema>

export const AssignToSegmentSchema = z.object({
  contactId: z.string().uuid(),
})
export type AssignToSegment = z.infer<typeof AssignToSegmentSchema>
