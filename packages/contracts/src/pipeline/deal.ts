import { z } from 'zod'

export const DealSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  pipelineId: z.string().uuid(),
  stageId: z.string().uuid(),
  contactId: z.string().uuid().nullable(),
  companyId: z.string().uuid().nullable(),
  name: z.string().min(1).max(255),
  amount: z.number().default(0),
  expectedCloseDate: z.string().nullable(),
  status: z.enum(['OPEN', 'WON', 'LOST']).default('OPEN'),
  assignedUserId: z.string().uuid().nullable(),
  lostReasonId: z.string().uuid().nullable(),
  lostNotes: z.string().nullable(),
  partnerId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Deal = z.infer<typeof DealSchema>

export const CreateDealSchema = z.object({
  pipelineId: z.string().uuid(),
  stageId: z.string().uuid(),
  contactId: z.string().uuid().nullable().optional(),
  companyId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(255),
  amount: z.number().default(0),
  expectedCloseDate: z.string().nullable().optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
})
export type CreateDeal = z.infer<typeof CreateDealSchema>

export const UpdateDealSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  amount: z.number().optional(),
  expectedCloseDate: z.string().nullable().optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
}).partial()
export type UpdateDeal = z.infer<typeof UpdateDealSchema>

export const MoveDealSchema = z.object({
  stageId: z.string().uuid(),
})
export type MoveDeal = z.infer<typeof MoveDealSchema>

export const WinDealSchema = z.object({
  amount: z.number().optional(),
})
export type WinDeal = z.infer<typeof WinDealSchema>

export const LoseDealSchema = z.object({
  lostReasonId: z.string().uuid().optional(),
  lostNotes: z.string().optional(),
})
export type LoseDeal = z.infer<typeof LoseDealSchema>

export const DealFilterSchema = z.object({
  pipelineId: z.string().uuid().optional(),
  stageId: z.string().uuid().optional(),
  status: z.enum(['OPEN', 'WON', 'LOST']).optional(),
  contactId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  assignedUserId: z.string().uuid().optional(),
  search: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
export type DealFilter = z.infer<typeof DealFilterSchema>
