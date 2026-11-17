import { z } from 'zod'

export const PaymentGatewaySchema = z.enum(['STRIPE', 'WOMPI', 'MERCADOPAGO', 'BANK_TRANSFER'])
export type PaymentGateway = z.infer<typeof PaymentGatewaySchema>

export const PaymentStatusSchema = z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED'])
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>

export const PaymentResourceTypeSchema = z.enum(['QUOTE', 'CONTRACT', 'DEAL'])
export type PaymentResourceType = z.infer<typeof PaymentResourceTypeSchema>

export const CreatePaymentLinkDtoSchema = z.object({
  resourceType: PaymentResourceTypeSchema,
  resourceId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  gateway: PaymentGatewaySchema.default('STRIPE'),
  description: z.string().min(1).max(255),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
})
export type CreatePaymentLinkDto = z.infer<typeof CreatePaymentLinkDtoSchema>

export const PaymentTransactionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  resourceType: PaymentResourceTypeSchema,
  resourceId: z.string().uuid(),
  gateway: PaymentGatewaySchema,
  externalPaymentId: z.string().nullable().optional(),
  paymentUrl: z.string().url(),
  amount: z.number(),
  currency: z.string(),
  status: PaymentStatusSchema,
  customerEmail: z.string().nullable().optional(),
  customerName: z.string().nullable().optional(),
  paidAt: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type PaymentTransaction = z.infer<typeof PaymentTransactionSchema>
