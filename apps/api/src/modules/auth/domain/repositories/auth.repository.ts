import { Session } from '../entities/session.entity'
import { MfaMethod } from '../entities/mfa-method.entity'
import { MfaRecoveryCode } from '../entities/mfa-recovery-code.entity'
import { PasswordPolicy } from '../entities/password-policy.entity'
import { PasswordHistory } from '../entities/password-history.entity'
import { IpRestriction } from '../entities/ip-restriction.entity'
import { OAuthProvider } from '../entities/oauth-provider.entity'

export abstract class AuthRepository {
  abstract findSessionById(id: string): Promise<Session | null>
  abstract findSessionByRefreshTokenHash(tenantId: string, hash: string): Promise<Session | null>
  abstract listSessionsByUser(tenantId: string, userId: string): Promise<Session[]>
  abstract saveSession(session: Session): Promise<void>

  abstract findMfaMethodsByUser(tenantId: string, userId: string): Promise<MfaMethod[]>
  abstract findMfaMethodById(id: string): Promise<MfaMethod | null>
  abstract saveMfaMethod(method: MfaMethod): Promise<void>

  abstract findRecoveryCodesByUser(userId: string): Promise<MfaRecoveryCode[]>
  abstract findUnusedRecoveryCodesByUser(userId: string): Promise<MfaRecoveryCode[]>
  abstract saveRecoveryCode(code: MfaRecoveryCode): Promise<void>
  abstract saveRecoveryCodes(codes: MfaRecoveryCode[]): Promise<void>
  abstract deleteRecoveryCodesByUser(userId: string): Promise<void>

  abstract getPasswordPolicy(tenantId: string): Promise<PasswordPolicy | null>
  abstract savePasswordPolicy(policy: PasswordPolicy): Promise<void>

  abstract findPasswordHistoryByUser(userId: string, limit: number): Promise<PasswordHistory[]>
  abstract savePasswordHistory(history: PasswordHistory): Promise<void>

  abstract findIpRestrictionById(id: string): Promise<IpRestriction | null>
  abstract listIpRestrictions(tenantId: string, userId?: string): Promise<IpRestriction[]>
  abstract saveIpRestriction(restriction: IpRestriction): Promise<void>
  abstract deleteIpRestriction(id: string): Promise<void>

  abstract findOAuthProviderById(id: string): Promise<OAuthProvider | null>
  abstract findOAuthProviderByName(tenantId: string, providerName: string): Promise<OAuthProvider | null>
  abstract listOAuthProviders(tenantId: string): Promise<OAuthProvider[]>
  abstract saveOAuthProvider(provider: OAuthProvider): Promise<void>
  abstract deleteOAuthProvider(id: string): Promise<void>
}
