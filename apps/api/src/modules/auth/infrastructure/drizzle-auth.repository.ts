/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import { getDb } from '@crm/database'
import {
  mfaMethods as mfaMethodsTable,
  mfaRecoveryCodes as recoveryCodesTable,
  sessions as sessionsTable,
  ipRestrictions as ipRestrictionsTable,
  oauthProviders as oauthProvidersTable,
  passwordPolicies as passwordPoliciesTable,
  passwordHistory as passwordHistoryTable,
} from '@crm/database'
import { AuthRepository } from '../domain/repositories/auth.repository'
import { Session } from '../domain/entities/session.entity'
import { MfaMethod } from '../domain/entities/mfa-method.entity'
import { MfaRecoveryCode } from '../domain/entities/mfa-recovery-code.entity'
import { PasswordPolicy } from '../domain/entities/password-policy.entity'
import { PasswordHistory } from '../domain/entities/password-history.entity'
import { IpRestriction } from '../domain/entities/ip-restriction.entity'
import { OAuthProvider } from '../domain/entities/oauth-provider.entity'
import { AuthMapper } from './auth.mapper'

@Injectable()
export class DrizzleAuthRepository extends AuthRepository {
  private get db() { return getDb() }

  async findSessionById(id: string): Promise<Session | null> {
    const row = await this.db.query.sessions.findFirst({
      where: eq(sessionsTable.id, id) as any,
    })
    if (!row) return null
    return AuthMapper.sessionToDomain(row as any)
  }

  async findSessionByRefreshTokenHash(tenantId: string, hash: string): Promise<Session | null> {
    const row = await this.db.query.sessions.findFirst({
      where: and(
        eq(sessionsTable.tenantId, tenantId) as any,
        eq(sessionsTable.refreshTokenHash, hash) as any,
      ) as any,
    })
    if (!row) return null
    return AuthMapper.sessionToDomain(row as any)
  }

  async listSessionsByUser(tenantId: string, userId: string): Promise<Session[]> {
    const rows = await this.db.query.sessions.findMany({
      where: and(
        eq(sessionsTable.tenantId, tenantId) as any,
        eq(sessionsTable.userId, userId) as any,
      ) as any,
    })
    return rows.map(r => AuthMapper.sessionToDomain(r as any))
  }

  async saveSession(session: Session): Promise<void> {
    await this.db.insert(sessionsTable).values({
      id: session.id,
      tenantId: session.tenantId,
      userId: session.userId,
      refreshTokenHash: session.refreshTokenHash,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      deviceId: session.deviceId,
      expiresAt: session.expiresAt,
      isRevoked: session.isRevoked,
      createdAt: session.createdAt,
    } as any).onConflictDoUpdate({
      target: sessionsTable.id,
      set: {
        refreshTokenHash: session.refreshTokenHash,
        isRevoked: session.isRevoked,
      } as any,
    })
  }

  async findMfaMethodsByUser(tenantId: string, userId: string): Promise<MfaMethod[]> {
    const rows = await this.db.query.mfaMethods.findMany({
      where: and(
        eq(mfaMethodsTable.tenantId, tenantId) as any,
        eq(mfaMethodsTable.userId, userId) as any,
      ) as any,
    })
    return rows.map(r => AuthMapper.mfaMethodToDomain(r as any))
  }

  async findMfaMethodById(id: string): Promise<MfaMethod | null> {
    const row = await this.db.query.mfaMethods.findFirst({
      where: eq(mfaMethodsTable.id, id) as any,
    })
    if (!row) return null
    return AuthMapper.mfaMethodToDomain(row as any)
  }

  async saveMfaMethod(method: MfaMethod): Promise<void> {
    await this.db.insert(mfaMethodsTable).values({
      id: method.id,
      tenantId: method.tenantId,
      userId: method.userId,
      type: method.type,
      secret: method.secret,
      isPrimary: method.isPrimary,
      isActive: method.isActive,
      createdAt: method.createdAt,
    } as any)
  }

  async findRecoveryCodesByUser(userId: string): Promise<MfaRecoveryCode[]> {
    const rows = await this.db.query.mfaRecoveryCodes.findMany({
      where: eq(recoveryCodesTable.userId, userId) as any,
    })
    return rows.map(r => AuthMapper.recoveryCodeToDomain(r as any))
  }

  async findUnusedRecoveryCodesByUser(userId: string): Promise<MfaRecoveryCode[]> {
    const rows = await this.db.query.mfaRecoveryCodes.findMany({
      where: and(
        eq(recoveryCodesTable.userId, userId) as any,
        eq(recoveryCodesTable.isUsed, false) as any,
      ) as any,
    })
    return rows.map(r => AuthMapper.recoveryCodeToDomain(r as any))
  }

  async saveRecoveryCode(code: MfaRecoveryCode): Promise<void> {
    await this.db.insert(recoveryCodesTable).values({
      id: code.id,
      userId: code.userId,
      codeHash: code.codeHash,
      isUsed: code.isUsed,
      usedAt: code.usedAt,
      createdAt: code.createdAt,
    } as any).onConflictDoUpdate({
      target: recoveryCodesTable.id,
      set: { isUsed: code.isUsed, usedAt: code.usedAt } as any,
    })
  }

  async saveRecoveryCodes(codes: MfaRecoveryCode[]): Promise<void> {
    for (const code of codes) {
      await this.saveRecoveryCode(code)
    }
  }

  async deleteRecoveryCodesByUser(userId: string): Promise<void> {
    await this.db.delete(recoveryCodesTable).where(
      eq(recoveryCodesTable.userId, userId) as any,
    )
  }

  async getPasswordPolicy(tenantId: string): Promise<PasswordPolicy | null> {
    const row = await this.db.query.passwordPolicies.findFirst({
      where: eq(passwordPoliciesTable.tenantId, tenantId) as any,
    })
    if (!row) return null
    return AuthMapper.passwordPolicyToDomain(row as any)
  }

  async savePasswordPolicy(policy: PasswordPolicy): Promise<void> {
    await this.db.insert(passwordPoliciesTable).values({
      tenantId: policy.tenantId,
      minLength: policy.minLength,
      requireUppercase: policy.requireUppercase,
      requireNumbers: policy.requireNumbers,
      requireSymbols: policy.requireSymbols,
      expireDays: policy.expireDays,
      preventReuseLastN: policy.preventReuseLastN,
      updatedAt: policy.updatedAt,
    } as any).onConflictDoUpdate({
      target: passwordPoliciesTable.tenantId,
      set: {
        minLength: policy.minLength,
        requireUppercase: policy.requireUppercase,
        requireNumbers: policy.requireNumbers,
        requireSymbols: policy.requireSymbols,
        expireDays: policy.expireDays,
        preventReuseLastN: policy.preventReuseLastN,
        updatedAt: policy.updatedAt,
      } as any,
    })
  }

  async findPasswordHistoryByUser(userId: string, limit: number): Promise<PasswordHistory[]> {
    const rows = await this.db.query.passwordHistory.findMany({
      where: eq(passwordHistoryTable.userId, userId) as any,
      limit,
      orderBy: (cols: any) => [cols.createdAt],
    })
    return rows.map(r => AuthMapper.passwordHistoryToDomain(r as any))
  }

  async savePasswordHistory(history: PasswordHistory): Promise<void> {
    await this.db.insert(passwordHistoryTable).values({
      id: history.id,
      userId: history.userId,
      passwordHash: history.passwordHash,
      createdAt: history.createdAt,
    } as any)
  }

  async findIpRestrictionById(id: string): Promise<IpRestriction | null> {
    const row = await this.db.query.ipRestrictions.findFirst({
      where: eq(ipRestrictionsTable.id, id) as any,
    })
    if (!row) return null
    return AuthMapper.ipRestrictionToDomain(row as any)
  }

  async listIpRestrictions(tenantId: string, userId?: string): Promise<IpRestriction[]> {
    const conditions: any[] = [eq(ipRestrictionsTable.tenantId, tenantId)]
    if (userId) conditions.push(eq(ipRestrictionsTable.userId, userId))
    const rows = await this.db.query.ipRestrictions.findMany({
      where: and(...conditions) as any,
    })
    return rows.map(r => AuthMapper.ipRestrictionToDomain(r as any))
  }

  async saveIpRestriction(restriction: IpRestriction): Promise<void> {
    await this.db.insert(ipRestrictionsTable).values({
      id: restriction.id,
      tenantId: restriction.tenantId,
      userId: restriction.userId,
      ipAddress: restriction.ipAddress,
      type: restriction.type,
      description: restriction.description,
      createdAt: restriction.createdAt,
    } as any)
  }

  async deleteIpRestriction(id: string): Promise<void> {
    await this.db.delete(ipRestrictionsTable).where(eq(ipRestrictionsTable.id, id) as any)
  }

  async findOAuthProviderById(id: string): Promise<OAuthProvider | null> {
    const row = await this.db.query.oauthProviders.findFirst({
      where: eq(oauthProvidersTable.id, id) as any,
    })
    if (!row) return null
    return AuthMapper.oauthProviderToDomain(row as any)
  }

  async findOAuthProviderByName(tenantId: string, providerName: string): Promise<OAuthProvider | null> {
    const row = await this.db.query.oauthProviders.findFirst({
      where: and(
        eq(oauthProvidersTable.tenantId, tenantId) as any,
        eq(oauthProvidersTable.providerName, providerName) as any,
      ) as any,
    })
    if (!row) return null
    return AuthMapper.oauthProviderToDomain(row as any)
  }

  async listOAuthProviders(tenantId: string): Promise<OAuthProvider[]> {
    const rows = await this.db.query.oauthProviders.findMany({
      where: eq(oauthProvidersTable.tenantId, tenantId) as any,
    })
    return rows.map(r => AuthMapper.oauthProviderToDomain(r as any))
  }

  async saveOAuthProvider(provider: OAuthProvider): Promise<void> {
    await this.db.insert(oauthProvidersTable).values({
      id: provider.id,
      tenantId: provider.tenantId,
      providerName: provider.providerName,
      clientId: provider.clientId,
      clientSecret: provider.clientSecret,
      isActive: provider.isActive,
      createdAt: provider.createdAt,
    } as any)
  }

  async deleteOAuthProvider(id: string): Promise<void> {
    await this.db.delete(oauthProvidersTable).where(eq(oauthProvidersTable.id, id) as any)
  }
}
