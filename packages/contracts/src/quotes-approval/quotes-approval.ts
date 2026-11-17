import { z } from 'zod'

export const ApproverRoleSchema = z.enum(['SALES_MANAGER', 'VP_SALES', 'CFO', 'CEO'])
export type ApproverRole = z.infer<typeof ApproverRoleSchema>

export const DiscountApprovalRuleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  minDiscountPct: z.number(),
  maxDiscountPct: z.number(),
  approverRole: ApproverRoleSchema,
  requiresStrictApproval: z.boolean(),
  createdAt: z.string(),
})
export type DiscountApprovalRule = z.infer<typeof DiscountApprovalRuleSchema>

export const CreateDiscountApprovalRuleDtoSchema = z.object({
  minDiscountPct: z.number().min(0).max(100),
  maxDiscountPct: z.number().min(0).max(100),
  approverRole: ApproverRoleSchema.default('SALES_MANAGER'),
  requiresStrictApproval: z.boolean().default(true).optional(),
})
export type CreateDiscountApprovalRuleDto = z.infer<typeof CreateDiscountApprovalRuleDtoSchema>

export const QuoteApprovalRequestSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  quoteId: z.string().uuid(),
  requestedDiscountPct: z.number(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  requestedByUserId: z.string().uuid().nullable().optional(),
  reviewedByUserId: z.string().uuid().nullable().optional(),
  reviewNotes: z.string().nullable().optional(),
  reviewedAt: z.string().nullable().optional(),
  createdAt: z.string(),
})
export type QuoteApprovalRequest = z.infer<typeof QuoteApprovalRequestSchema>

export const RequestQuoteApprovalDtoSchema = z.object({
  quoteId: z.string().uuid(),
  requestedDiscountPct: z.number().min(0).max(100),
})
export type RequestQuoteApprovalDto = z.infer<typeof RequestQuoteApprovalDtoSchema>

export const CustomerQuoteAcceptanceSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  quoteId: z.string().uuid(),
  securityToken: z.string(),
  clientSignerName: z.string().nullable().optional(),
  clientSignerEmail: z.string().nullable().optional(),
  clientIpAddress: z.string().nullable().optional(),
  status: z.enum(['VIEWED', 'ACCEPTED', 'REJECTED']),
  feedback: z.string().nullable().optional(),
  acceptedAt: z.string().nullable().optional(),
  createdAt: z.string(),
})
export type CustomerQuoteAcceptance = z.infer<typeof CustomerQuoteAcceptanceSchema>

export const SubmitCustomerQuoteAcceptanceDtoSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
  clientSignerName: z.string().min(2),
  clientSignerEmail: z.string().email(),
  feedback: z.string().optional(),
})
export type SubmitCustomerQuoteAcceptanceDto = z.infer<typeof SubmitCustomerQuoteAcceptanceDtoSchema>
