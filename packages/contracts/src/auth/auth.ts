import { z } from 'zod'

export const MfaType = z.enum(['TOTP', 'SMS', 'EMAIL'])
export type MfaType = z.infer<typeof MfaType>

export const IpRestrictionType = z.enum(['ALLOW', 'DENY'])
export type IpRestrictionType = z.infer<typeof IpRestrictionType>

export const LoginSchema = z.object({
  tenantId: z.string().uuid(),
  email: z.string().email().max(255).transform(v => v.toLowerCase().trim()),
  password: z.string().min(1).max(255),
  ipAddress: z.string().max(50).optional(),
  userAgent: z.string().optional(),
  deviceId: z.string().max(255).optional(),
  mfaCode: z.string().max(10).optional(),
})
export type LoginInput = z.infer<typeof LoginSchema>

export const SetupMfaSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  type: MfaType,
  phone: z.string().max(50).optional(),
  email: z.string().email().optional(),
})
export type SetupMfaInput = z.infer<typeof SetupMfaSchema>

export const VerifyMfaSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  code: z.string().min(1).max(10),
  methodId: z.string().uuid(),
})
export type VerifyMfaInput = z.infer<typeof VerifyMfaSchema>

export const ChangePasswordSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  currentPassword: z.string().min(1).max(255),
  newPassword: z.string().min(8).max(255),
})
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>

export const UpdatePasswordPolicySchema = z.object({
  tenantId: z.string().uuid(),
  minLength: z.number().int().min(4).max(128).optional(),
  requireUppercase: z.boolean().optional(),
  requireNumbers: z.boolean().optional(),
  requireSymbols: z.boolean().optional(),
  expireDays: z.number().int().min(0).max(9999).optional(),
  preventReuseLastN: z.number().int().min(0).max(100).optional(),
})
export type UpdatePasswordPolicyInput = z.infer<typeof UpdatePasswordPolicySchema>

export const CreateIpRestrictionSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid().nullable().optional(),
  ipAddress: z.string().max(50),
  type: IpRestrictionType,
  description: z.string().optional(),
})
export type CreateIpRestrictionInput = z.infer<typeof CreateIpRestrictionSchema>

export const CreateOAuthProviderSchema = z.object({
  tenantId: z.string().uuid(),
  providerName: z.string().max(50),
  clientId: z.string().max(255),
  clientSecret: z.string().max(255),
})
export type CreateOAuthProviderInput = z.infer<typeof CreateOAuthProviderSchema>

export const RefreshTokenSchema = z.object({
  tenantId: z.string().uuid(),
  refreshToken: z.string().min(1),
})
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>
