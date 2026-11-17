import { Session } from '../domain/entities/session.entity'
import { MfaMethod } from '../domain/entities/mfa-method.entity'
import { MfaRecoveryCode } from '../domain/entities/mfa-recovery-code.entity'
import { PasswordPolicy } from '../domain/entities/password-policy.entity'
import { PasswordHistory } from '../domain/entities/password-history.entity'
import { IpRestriction } from '../domain/entities/ip-restriction.entity'
import { OAuthProvider } from '../domain/entities/oauth-provider.entity'

interface SessionRow {
  id: string; tenantId: string; userId: string; refreshTokenHash: string
  ipAddress: string | null; userAgent: string | null; deviceId: string | null
  expiresAt: Date; isRevoked: boolean; createdAt: Date
}

interface MfaMethodRow {
  id: string; tenantId: string; userId: string; type: string
  secret: string; isPrimary: boolean | null; isActive: boolean | null; createdAt: Date
}

interface MfaRecoveryCodeRow {
  id: string; userId: string; codeHash: string
  isUsed: boolean | null; usedAt: Date | null; createdAt: Date
}

interface PasswordPolicyRow {
  tenantId: string; minLength: number | null; requireUppercase: boolean | null
  requireNumbers: boolean | null; requireSymbols: boolean | null
  expireDays: number | null; preventReuseLastN: number | null; updatedAt: Date
}

interface PasswordHistoryRow {
  id: string; userId: string; passwordHash: string; createdAt: Date
}

interface IpRestrictionRow {
  id: string; tenantId: string; userId: string | null
  ipAddress: string; type: string; description: string | null; createdAt: Date
}

interface OAuthProviderRow {
  id: string; tenantId: string; providerName: string
  clientId: string; clientSecret: string; isActive: boolean | null; createdAt: Date
}

export class AuthMapper {
  static sessionToDomain(row: SessionRow): Session {
    return new Session(
      row.id, row.tenantId, row.userId, row.refreshTokenHash,
      row.ipAddress, row.userAgent, row.deviceId,
      row.expiresAt, row.isRevoked, row.createdAt,
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
      row.type as 'TOTP' | 'SMS' | 'EMAIL',
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
      row.ipAddress, row.type as 'ALLOW' | 'DENY',
      row.description, row.createdAt,
    )
  }

  static ipRestrictionToResponse(r: IpRestriction) {
    return {
      id: r.id,
      userId: r.userId,
      ipAddress: r.ipAddress,
      type: r.type,
      description: r.description,
      createdAt: r.createdAt.toISOString(),
    }
  }

  static oauthProviderToDomain(row: OAuthProviderRow): OAuthProvider {
    return new OAuthProvider(
      row.id, row.tenantId, row.providerName,
      row.clientId, row.clientSecret,
      row.isActive ?? true, row.createdAt,
    )
  }

  static oauthProviderToResponse(p: OAuthProvider) {
    return {
      id: p.id,
      providerName: p.providerName,
      clientId: p.clientId,
      isActive: p.isActive,
      createdAt: p.createdAt.toISOString(),
    }
  }
}
