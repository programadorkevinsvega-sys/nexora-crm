import { z } from 'zod'

export const UserStatus = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED'])
export type UserStatus = z.infer<typeof UserStatus>

export const ProfileType = z.enum(['NATURAL_PERSON', 'LEGAL_ENTITY'])
export type ProfileType = z.infer<typeof ProfileType>

export const UserPlatform = z.enum(['IOS', 'ANDROID', 'WEB', 'OTHER'])
export type UserPlatform = z.infer<typeof UserPlatform>

export const CreateUserSchema = z.object({
  tenantId: z.string().uuid(),
  email: z.string().email().max(255).transform(v => v.toLowerCase().trim()),
  passwordHash: z.string().min(60).max(255).optional(),
  profileType: ProfileType,
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  identificationNumber: z.string().max(50).optional(),
  phone: z.string().max(50).optional(),
  countryCode: z.string().max(5).optional(),
  preferredLanguage: z.string().max(5).default('es'),
  timezone: z.string().max(100).default('America/Bogota'),
  avatarUrl: z.string().url().or(z.literal('')).optional(),
  legalName: z.string().max(255).optional(),
  commercialName: z.string().max(255).optional(),
  taxId: z.string().max(50).optional(),
  legalAddress: z.string().optional(),
  managerId: z.string().uuid().optional(),
})
export type CreateUserInput = z.infer<typeof CreateUserSchema>

export const UpdateUserSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  email: z.string().email().max(255).transform(v => v.toLowerCase().trim()).optional(),
  passwordHash: z.string().min(60).max(255).optional(),
  status: UserStatus.optional(),
  managerId: z.string().uuid().nullable().optional(),
})
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>

export const UpdateNaturalPersonProfileSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  identificationNumber: z.string().max(50).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  countryCode: z.string().max(5).nullable().optional(),
  preferredLanguage: z.string().max(5).optional(),
  timezone: z.string().max(100).optional(),
  avatarUrl: z.string().url().or(z.literal('')).nullable().optional(),
})
export type UpdateNaturalPersonProfileInput = z.infer<typeof UpdateNaturalPersonProfileSchema>

export const UpdateLegalEntityProfileSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  legalName: z.string().max(255).optional(),
  commercialName: z.string().max(255).nullable().optional(),
  taxId: z.string().max(50).optional(),
  legalAddress: z.string().nullable().optional(),
  countryCode: z.string().max(5).nullable().optional(),
  isActive: z.boolean().optional(),
})
export type UpdateLegalEntityProfileInput = z.infer<typeof UpdateLegalEntityProfileSchema>

export const LinkOAuthSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  providerName: z.string().max(50),
  providerUserId: z.string().max(255),
})
export type LinkOAuthInput = z.infer<typeof LinkOAuthSchema>

export const UnlinkOAuthSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  providerName: z.string().max(50),
})
export type UnlinkOAuthInput = z.infer<typeof UnlinkOAuthSchema>

export const RegisterDeviceSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  deviceIdentifier: z.string().max(255),
  platform: UserPlatform,
  deviceModel: z.string().max(100).optional(),
  osVersion: z.string().max(50).optional(),
  pushNotificationToken: z.string().optional(),
  isTrustedDevice: z.boolean().default(false),
})
export type RegisterDeviceInput = z.infer<typeof RegisterDeviceSchema>

export const UpdateDeviceSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  deviceId: z.string().uuid(),
  deviceModel: z.string().max(100).nullable().optional(),
  osVersion: z.string().max(50).nullable().optional(),
  pushNotificationToken: z.string().nullable().optional(),
  isTrustedDevice: z.boolean().optional(),
})
export type UpdateDeviceInput = z.infer<typeof UpdateDeviceSchema>

export const RemoveDeviceSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  deviceId: z.string().uuid(),
})
export type RemoveDeviceInput = z.infer<typeof RemoveDeviceSchema>

export const ListUsersQuerySchema = z.object({
  tenantId: z.string().uuid(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: UserStatus.optional(),
  profileType: ProfileType.optional(),
})
export type ListUsersQueryInput = z.infer<typeof ListUsersQuerySchema>
