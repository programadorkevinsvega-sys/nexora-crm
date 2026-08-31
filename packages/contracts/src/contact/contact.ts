import { z } from 'zod'

export const ContactSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  companyId: z.string().uuid().nullable(),

  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).nullable(),
  identificationType: z.string().max(50).nullable(),
  identificationNumber: z.string().max(100).nullable(),
  verificationDigit: z.string().max(5).nullable(),

  email: z.string().email().nullable(),
  phone: z.string().max(50).nullable(),
  birthDate: z.string().nullable(),

  streetAddress: z.string().max(255).nullable(),
  city: z.string().max(255).nullable(),
  stateProvince: z.string().max(255).nullable(),
  postalCode: z.string().max(50).nullable(),
  country: z.string().max(100).nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),

  nickname: z.string().max(255).nullable(),
  gender: z.string().max(50).nullable(),
  isStarred: z.boolean().default(false),
  isDeceased: z.boolean().default(false),
  stayInTouchFrequencyDays: z.number().int().nullable(),
  lastTalkedToAt: z.string().datetime().nullable(),

  taxRegime: z.string().max(100).nullable(),
  isTaxLiable: z.boolean().default(false),
  jobTitle: z.string().max(100).nullable(),
  leadSource: z.string().max(100).nullable(),
  leadStatus: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CUSTOMER', 'CHURNED']).default('NEW'),
  loyaltyPoints: z.number().int().default(0),
  avatarUrl: z.string().max(255).nullable(),
  metadata: z.record(z.unknown()).nullable(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Contact = z.infer<typeof ContactSchema>

export const CreateContactSchema = z.object({
  companyId: z.string().uuid().nullable().optional(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).nullable().optional(),
  identificationType: z.string().max(50).nullable().optional(),
  identificationNumber: z.string().max(100).nullable().optional(),
  verificationDigit: z.string().max(5).nullable().optional(),
  email: z.string().email().or(z.literal('')).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  birthDate: z.string().nullable().optional(),
  streetAddress: z.string().max(255).nullable().optional(),
  city: z.string().max(255).nullable().optional(),
  stateProvince: z.string().max(255).nullable().optional(),
  postalCode: z.string().max(50).nullable().optional(),
  country: z.string().max(100).nullable().optional(),
  nickname: z.string().max(255).nullable().optional(),
  gender: z.string().max(50).nullable().optional(),
  isStarred: z.boolean().nullable().optional(),
  isDeceased: z.boolean().nullable().optional(),
  stayInTouchFrequencyDays: z.number().int().nullable().optional(),
  lastTalkedToAt: z.string().nullable().optional(),
  taxRegime: z.string().max(100).nullable().optional(),
  isTaxLiable: z.boolean().nullable().optional(),
  jobTitle: z.string().max(100).nullable().optional(),
  leadSource: z.string().max(100).nullable().optional(),
  leadStatus: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CUSTOMER', 'CHURNED']).nullable().optional(),
  loyaltyPoints: z.number().int().nullable().optional(),
  avatarUrl: z.string().max(255).nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})
export type CreateContact = z.infer<typeof CreateContactSchema>

export const UpdateContactSchema = CreateContactSchema.partial()
export type UpdateContact = z.infer<typeof UpdateContactSchema>

export const ContactFilterSchema = z.object({
  search: z.string().optional(),
  leadStatus: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CUSTOMER', 'CHURNED']).optional(),
  companyId: z.string().uuid().optional(),
  isStarred: z.boolean().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
export type ContactFilter = z.infer<typeof ContactFilterSchema>
