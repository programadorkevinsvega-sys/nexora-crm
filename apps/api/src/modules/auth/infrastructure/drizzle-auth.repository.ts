import { Injectable } from '@nestjs/common'
import { AuthRepository } from '../domain/repositories/auth.repository'
import { Session } from '../domain/entities/session.entity'
import { MfaMethod } from '../domain/entities/mfa-method.entity'
import { MfaRecoveryCode } from '../domain/entities/mfa-recovery-code.entity'
import { PasswordPolicy } from '../domain/entities/password-policy.entity'
import { PasswordHistory } from '../domain/entities/password-history.entity'
import { IpRestriction } from '../domain/entities/ip-restriction.entity'
import { OAuthProvider } from '../domain/entities/oauth-provider.entity'
import { AuthSessionsMfaDrizzleHelper } from './auth-sessions-mfa.drizzle'
import { AuthPoliciesOauthDrizzleHelper } from './auth-policies-oauth.drizzle'

@Injectable()
export class DrizzleAuthRepository extends AuthRepository {
  findSessionById(id: string): Promise<Session | null> { return AuthSessionsMfaDrizzleHelper.findSessionById(id) }
  findSessionByRefreshTokenHash(tenantId: string, hash: string): Promise<Session | null> {
    return AuthSessionsMfaDrizzleHelper.findSessionByRefreshTokenHash(tenantId, hash)
  }
  listSessionsByUser(tenantId: string, userId: string): Promise<Session[]> {
    return AuthSessionsMfaDrizzleHelper.listSessionsByUser(tenantId, userId)
  }
  saveSession(session: Session): Promise<void> { return AuthSessionsMfaDrizzleHelper.saveSession(session) }
  findMfaMethodsByUser(tenantId: string, userId: string): Promise<MfaMethod[]> {
    return AuthSessionsMfaDrizzleHelper.findMfaMethodsByUser(tenantId, userId)
  }
  findMfaMethodById(id: string): Promise<MfaMethod | null> { return AuthSessionsMfaDrizzleHelper.findMfaMethodById(id) }
  saveMfaMethod(method: MfaMethod): Promise<void> { return AuthSessionsMfaDrizzleHelper.saveMfaMethod(method) }
  findRecoveryCodesByUser(userId: string): Promise<MfaRecoveryCode[]> {
    return AuthSessionsMfaDrizzleHelper.findRecoveryCodesByUser(userId)
  }
  findUnusedRecoveryCodesByUser(userId: string): Promise<MfaRecoveryCode[]> {
    return AuthSessionsMfaDrizzleHelper.findUnusedRecoveryCodesByUser(userId)
  }
  saveRecoveryCode(code: MfaRecoveryCode): Promise<void> { return AuthSessionsMfaDrizzleHelper.saveRecoveryCode(code) }
  saveRecoveryCodes(codes: MfaRecoveryCode[]): Promise<void> { return AuthSessionsMfaDrizzleHelper.saveRecoveryCodes(codes) }
  deleteRecoveryCodesByUser(userId: string): Promise<void> { return AuthSessionsMfaDrizzleHelper.deleteRecoveryCodesByUser(userId) }

  getPasswordPolicy(tenantId: string): Promise<PasswordPolicy | null> { return AuthPoliciesOauthDrizzleHelper.getPasswordPolicy(tenantId) }
  savePasswordPolicy(policy: PasswordPolicy): Promise<void> { return AuthPoliciesOauthDrizzleHelper.savePasswordPolicy(policy) }
  findPasswordHistoryByUser(userId: string, limit: number): Promise<PasswordHistory[]> {
    return AuthPoliciesOauthDrizzleHelper.findPasswordHistoryByUser(userId, limit)
  }
  savePasswordHistory(history: PasswordHistory): Promise<void> { return AuthPoliciesOauthDrizzleHelper.savePasswordHistory(history) }
  findIpRestrictionById(id: string): Promise<IpRestriction | null> { return AuthPoliciesOauthDrizzleHelper.findIpRestrictionById(id) }
  listIpRestrictions(tenantId: string, userId?: string): Promise<IpRestriction[]> {
    return AuthPoliciesOauthDrizzleHelper.listIpRestrictions(tenantId, userId)
  }
  saveIpRestriction(restriction: IpRestriction): Promise<void> { return AuthPoliciesOauthDrizzleHelper.saveIpRestriction(restriction) }
  deleteIpRestriction(id: string): Promise<void> { return AuthPoliciesOauthDrizzleHelper.deleteIpRestriction(id) }
  findOAuthProviderById(id: string): Promise<OAuthProvider | null> { return AuthPoliciesOauthDrizzleHelper.findOAuthProviderById(id) }
  findOAuthProviderByName(tenantId: string, providerName: string): Promise<OAuthProvider | null> {
    return AuthPoliciesOauthDrizzleHelper.findOAuthProviderByName(tenantId, providerName)
  }
  listOAuthProviders(tenantId: string): Promise<OAuthProvider[]> { return AuthPoliciesOauthDrizzleHelper.listOAuthProviders(tenantId) }
  saveOAuthProvider(provider: OAuthProvider): Promise<void> { return AuthPoliciesOauthDrizzleHelper.saveOAuthProvider(provider) }
  deleteOAuthProvider(id: string): Promise<void> { return AuthPoliciesOauthDrizzleHelper.deleteOAuthProvider(id) }
}
