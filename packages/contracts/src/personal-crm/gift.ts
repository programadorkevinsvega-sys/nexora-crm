import { z } from 'zod'

export const GiftSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  contactId: z.string().uuid(),
  direction: z.enum(['GIVEN', 'RECEIVED']),
  name: z.string().min(1).max(255),
  description: z.string().nullable(),
  url: z.string().max(500).nullable(),
  estimatedValue: z.number().default(0),
  status: z.enum(['IDEA', 'PURCHASED', 'GIVEN', 'RECEIVED']).default('IDEA'),
  dateGivenOrReceived: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Gift = z.infer<typeof GiftSchema>

export const CreateGiftSchema = z.object({
  contactId: z.string().uuid(),
  direction: z.enum(['GIVEN', 'RECEIVED']),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  url: z.string().max(500).optional(),
  estimatedValue: z.number().optional(),
  status: z.enum(['IDEA', 'PURCHASED', 'GIVEN', 'RECEIVED']).optional(),
  dateGivenOrReceived: z.string().optional(),
})
export type CreateGift = z.infer<typeof CreateGiftSchema>
