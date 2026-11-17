import { z } from 'zod'

export const CommissionCalculationModelSchema = z.enum(['FLAT_PERCENTAGE', 'TIERED_QUOTA', 'ACCELERATOR'])
export type CommissionCalculationModel = z.infer<typeof CommissionCalculationModelSchema>

export const CommissionRecordStatusSchema = z.enum(['PENDING', 'APPROVED', 'PAID', 'REJECTED'])
export type CommissionRecordStatus = z.infer<typeof CommissionRecordStatusSchema>

export const CommissionPlanSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  calculationModel: CommissionCalculationModelSchema,
  baseRate: z.number(),
  tierRules: z.array(z.record(z.any())),
  acceleratorRate: z.number().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type CommissionPlan = z.infer<typeof CommissionPlanSchema>

export const CreateCommissionPlanDtoSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  calculationModel: CommissionCalculationModelSchema.default('FLAT_PERCENTAGE'),
  baseRate: z.number().min(0).max(100).default(5.0),
  tierRules: z.array(z.record(z.any())).default([]),
  acceleratorRate: z.number().min(0).max(100).optional(),
  isActive: z.boolean().default(true).optional(),
})
export type CreateCommissionPlanDto = z.infer<typeof CreateCommissionPlanDtoSchema>

export const CommissionRecordSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  planId: z.string().uuid().nullable().optional(),
  dealId: z.string().uuid(),
  userId: z.string().uuid(),
  dealValue: z.number(),
  commissionRate: z.number(),
  commissionAmount: z.number(),
  splitPercentage: z.number(),
  status: CommissionRecordStatusSchema,
  period: z.string(),
  approvedByUserId: z.string().uuid().nullable().optional(),
  approvedAt: z.string().nullable().optional(),
  paidAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type CommissionRecord = z.infer<typeof CommissionRecordSchema>

export const CalculateCommissionDtoSchema = z.object({
  dealId: z.string().uuid(),
  userId: z.string().uuid(),
  dealValue: z.number().min(0),
  splitPercentage: z.number().min(1).max(100).default(100).optional(),
  quotaAttainmentPct: z.number().min(0).optional(),
})
export type CalculateCommissionDto = z.infer<typeof CalculateCommissionDtoSchema>
