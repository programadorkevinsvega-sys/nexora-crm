import { z } from 'zod'

export const DealSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  pipelineId: z.string().uuid(),
  stageId: z.string().uuid(),
  contactId: z.string().uuid().nullable().optional(),
  companyId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(255),
  amount: z.number().default(0),
  currency: z.string().default('USD').optional(),
  expectedCloseDate: z.string().nullable().optional(),
  actualCloseDate: z.string().datetime().nullable().optional(),
  status: z.enum(['OPEN', 'WON', 'LOST']).default('OPEN'),
  probabilityOverride: z.number().int().min(0).max(100).nullable().optional(),
  forecastCategory: z.enum(['PIPELINE', 'BEST_CASE', 'COMMIT', 'CLOSED']).default('PIPELINE').optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
  lossReason: z.string().nullable().optional(),
  lossReasonId: z.string().uuid().nullable().optional(),
  lostNotes: z.string().nullable().optional(),
  territoryId: z.string().uuid().nullable().optional(),
  priceBookId: z.string().uuid().nullable().optional(),
  partnerId: z.string().uuid().nullable().optional(),
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
  currency: z.string().default('USD').optional(),
  expectedCloseDate: z.string().nullable().optional(),
  probabilityOverride: z.number().int().min(0).max(100).optional(),
  forecastCategory: z.enum(['PIPELINE', 'BEST_CASE', 'COMMIT', 'CLOSED']).optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
  territoryId: z.string().uuid().nullable().optional(),
  priceBookId: z.string().uuid().nullable().optional(),
})
export type CreateDeal = z.infer<typeof CreateDealSchema>

export const UpdateDealSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  amount: z.number().optional(),
  currency: z.string().optional(),
  expectedCloseDate: z.string().nullable().optional(),
  actualCloseDate: z.string().nullable().optional(),
  probabilityOverride: z.number().int().min(0).max(100).nullable().optional(),
  forecastCategory: z.enum(['PIPELINE', 'BEST_CASE', 'COMMIT', 'CLOSED']).optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
  lossReason: z.string().nullable().optional(),
  territoryId: z.string().uuid().nullable().optional(),
  priceBookId: z.string().uuid().nullable().optional(),
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
  lossReason: z.string().optional(),
  lostReasonId: z.string().uuid().optional(),
  lostNotes: z.string().optional(),
})
export type LoseDeal = z.infer<typeof LoseDealSchema>

export const DealFilterSchema = z.object({
  pipelineId: z.string().uuid().optional(),
  stageId: z.string().uuid().optional(),
  status: z.enum(['OPEN', 'WON', 'LOST']).optional(),
  forecastCategory: z.string().optional(),
  contactId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  assignedUserId: z.string().uuid().optional(),
  territoryId: z.string().uuid().optional(),
  search: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
export type DealFilter = z.infer<typeof DealFilterSchema>
