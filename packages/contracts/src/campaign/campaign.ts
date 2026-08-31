import { z } from 'zod'

export const CampaignSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(255),
  type: z.string().max(100).nullable(),
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED']).default('PLANNED'),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  budgetedCost: z.number().default(0),
  actualCost: z.number().default(0),
  expectedRevenue: z.number().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Campaign = z.infer<typeof CampaignSchema>

export const CreateCampaignSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string().max(100).nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  budgetedCost: z.number().default(0),
  expectedRevenue: z.number().default(0),
})
export type CreateCampaign = z.infer<typeof CreateCampaignSchema>
