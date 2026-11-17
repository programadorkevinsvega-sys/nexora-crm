import { z } from 'zod'

export const ContractSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  companyId: z.string().uuid(),
  dealId: z.string().uuid().nullable(),
  name: z.string().min(1).max(255),
  startDate: z.string(),
  endDate: z.string().nullable(),
  autoRenew: z.boolean().default(false),
  mrrValue: z.number().default(0),
  status: z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'RENEWED']).default('ACTIVE'),
  ownerUserId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Contract = z.infer<typeof ContractSchema>

export const CreateContractSchema = z.object({
  companyId: z.string().uuid(),
  dealId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(255),
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
  autoRenew: z.boolean().optional().default(false),
  mrrValue: z.preprocess((val) => (val === null || val === '' || val === undefined ? 0 : Number(val)), z.number().default(0)),
  status: z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'RENEWED']).optional().default('DRAFT'),
  ownerUserId: z.string().uuid().nullable().optional(),
})
export type CreateContract = z.infer<typeof CreateContractSchema>
