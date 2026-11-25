import { Session } from '../domain/entities/session.entity'
import { MfaMethod } from '../domain/entities/mfa-method.entity'
import { MfaRecoveryCode } from '../domain/entities/mfa-recovery-code.entity'
import { PasswordPolicy } from '../domain/entities/password-policy.entity'
import { PasswordHistory } from '../domain/entities/password-history.entity'
import { IpRestriction } from '../domain/entities/ip-restriction.entity'
import { OAuthProvider } from '../domain/entities/oauth-provider.entity'
import type {
  sessions,
  mfaMethods,
  mfaRecoveryCodes,
  passwordPolicies,
  passwordHistory,
  ipRestrictions,
  oauthProviders,
} from '@crm/database'

type SessionRow = typeof sessions.$inferSelect
type MfaMethodRow = typeof mfaMethods.$inferSelect
type MfaRecoveryCodeRow = typeof mfaRecoveryCodes.$inferSelect
type PasswordPolicyRow = typeof passwordPolicies.$inferSelect
type PasswordHistoryRow = typeof passwordHistory.$inferSelect
type IpRestrictionRow = typeof ipRestrictions.$inferSelect
type OAuthProviderRow = typeof oauthProviders.$inferSelect

function mfaMethodType(value: string): MfaMethod['type'] {
  if (value === 'TOTP' || value === 'SMS' || value === 'EMAIL') return value
  throw new Error(`Unsupported MFA method type: ${value}`)
}

function requiredSecret(value: string | null): string {
  if (value === null || value.length === 0) throw new Error('OAuth provider client secret is missing')
  return value
}

function ipRestrictionType(value: string): IpRestriction['type'] {
  if (value === 'ALLOW' || value === 'DENY') return value
  throw new Error(`Unsupported IP restriction type: ${value}`)
}

export class AuthMapper {
  static sessionToDomain(row: SessionRow): Session {
    return new Session(
      row.id, row.tenantId, row.userId, row.refreshTokenHash,
      row.ipAddress, row.userAgent, row.deviceId,
      row.expiresAt, row.isRevoked ?? false, row.createdAt,
    )
  }

  static sessionToResponse(session: Session) {
    return {
      id: session.id,
      userId: session.userId,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      deviceId: session.deviceId,
      expiresAt: session.expiresAt.toISOString(),
      isRevoked: session.isRevoked,
      createdAt: session.createdAt.toISOString(),
    }
  }

  static mfaMethodToDomain(row: MfaMethodRow): MfaMethod {
    return new MfaMethod(
      row.id, row.tenantId, row.userId,
      mfaMethodType(row.type),
      row.secret, row.isPrimary ?? false,
      row.isActive ?? true, row.createdAt,
    )
  }

  static mfaMethodToResponse(method: MfaMethod) {
    return {
      id: method.id,
      type: method.type,
      isPrimary: method.isPrimary,
      isActive: method.isActive,
      createdAt: method.createdAt.toISOString(),
    }
  }

  static recoveryCodeToDomain(row: MfaRecoveryCodeRow): MfaRecoveryCode {
    return new MfaRecoveryCode(
      row.id, row.userId, row.codeHash,
      row.isUsed ?? false, row.usedAt, row.createdAt,
    )
  }

  static passwordPolicyToDomain(row: PasswordPolicyRow): PasswordPolicy {
    return new PasswordPolicy(
      row.tenantId,
      row.minLength ?? 8,
      row.requireUppercase ?? true,
      row.requireNumbers ?? true,
      row.requireSymbols ?? true,
      row.expireDays ?? 90,
      row.preventReuseLastN ?? 3,
      row.updatedAt,
    )
  }

  static passwordPolicyToResponse(policy: PasswordPolicy) {
    return {
      tenantId: policy.tenantId,
      minLength: policy.minLength,
      requireUppercase: policy.requireUppercase,
      requireNumbers: policy.requireNumbers,
      requireSymbols: policy.requireSymbols,
      expireDays: policy.expireDays,
      preventReuseLastN: policy.preventReuseLastN,
    }
  }

  static passwordHistoryToDomain(row: PasswordHistoryRow): PasswordHistory {
    return new PasswordHistory(row.id, row.userId, row.passwordHash, row.createdAt)
  }

  static ipRestrictionToDomain(row: IpRestrictionRow): IpRestriction {
    return new IpRestriction(
      row.id, row.tenantId, row.userId,
      row.ipAddress, ipRestrictionType(row.type),
      row.description, row.createdAt,
    )
  }

  static ipRestrictionToResponse(restriction: IpRestriction) {
    return {
      id: restriction.id,
      userId: restriction.userId,
      ipAddress: restriction.ipAddress,
      type: restriction.type,
      description: restriction.description,
      createdAt: restriction.createdAt.toISOString(),
    }
  }

  static oauthProviderToDomain(row: OAuthProviderRow): OAuthProvider {
    return new OAuthProvider(
      row.id, row.tenantId, row.providerName,
      row.clientId, requiredSecret(row.clientSecret),
      row.isActive ?? true, row.createdAt,
    )
  }

  static oauthProviderToResponse(provider: OAuthProvider) {
    return {
      id: provider.id,
      providerName: provider.providerName,
      clientId: provider.clientId,
      isActive: provider.isActive,
      createdAt: provider.createdAt.toISOString(),
    }
  }
}
