import { z } from 'zod'

export const DebtSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  contactId: z.string().uuid(),
  direction: z.enum(['OWES_ME', 'I_OWE']),
  amount: z.number().positive(),
  reason: z.string().min(1).max(500),
  status: z.enum(['UNPAID', 'PAID', 'FORGIVEN']).default('UNPAID'),
  dueDate: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Debt = z.infer<typeof DebtSchema>

export const CreateDebtSchema = z.object({
  contactId: z.string().uuid(),
  direction: z.enum(['OWES_ME', 'I_OWE']),
  amount: z.number().positive(),
  reason: z.string().min(1).max(500),
  status: z.enum(['UNPAID', 'PAID', 'FORGIVEN']).optional(),
  dueDate: z.string().optional(),
})
export type CreateDebt = z.infer<typeof CreateDebtSchema>
