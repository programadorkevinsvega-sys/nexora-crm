import { z } from 'zod'

export const AddressSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  contactId: z.string().uuid().nullable(),
  companyId: z.string().uuid().nullable(),
  addressType: z.enum(['BILLING', 'SHIPPING', 'HOME', 'WORK']).default('BILLING'),
  addressLine1: z.string().min(1).max(255),
  addressLine2: z.string().max(255).nullable(),
  city: z.string().max(100).nullable(),
  state: z.string().max(100).nullable(),
  postalCode: z.string().max(50).nullable(),
  country: z.string().max(100).nullable(),
  createdAt: z.string().datetime(),
})
export type Address = z.infer<typeof AddressSchema>

export const CreateAddressSchema = z.object({
  contactId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  addressType: z.enum(['BILLING', 'SHIPPING', 'HOME', 'WORK']).default('BILLING'),
  addressLine1: z.string().min(1).max(255),
  addressLine2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(50).optional(),
  country: z.string().max(100).optional(),
})
export type CreateAddress = z.infer<typeof CreateAddressSchema>
