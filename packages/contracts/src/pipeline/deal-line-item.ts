import { z } from 'zod'

export const DealLineItemSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  dealId: z.string().uuid(),
  productId: z.string().uuid(),
  productName: z.string().min(1).max(255),
  quantity: z.number().default(1),
  unitPrice: z.number(),
  discountPercent: z.number().min(0).max(100).default(0),
  totalPrice: z.number(),
  createdAt: z.string().datetime(),
})
export type DealLineItem = z.infer<typeof DealLineItemSchema>

export const CreateLineItemSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string().min(1).max(255),
  quantity: z.number().default(1),
  unitPrice: z.number(),
  discountPercent: z.number().min(0).max(100).default(0),
})
export type CreateLineItem = z.infer<typeof CreateLineItemSchema>
