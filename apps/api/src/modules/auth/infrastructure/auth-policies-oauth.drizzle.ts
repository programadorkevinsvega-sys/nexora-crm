import { eq, and, asc } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import {
  getDb,
  ipRestrictions as ipRestrictionsTable,
  oauthProviders as oauthProvidersTable,
  passwordPolicies as passwordPoliciesTable,
  passwordHistory as passwordHistoryTable,
} from '@crm/database'
import { PasswordPolicy } from '../domain/entities/password-policy.entity'
import { PasswordHistory } from '../domain/entities/password-history.entity'
import { IpRestriction } from '../domain/entities/ip-restriction.entity'
import { OAuthProvider } from '../domain/entities/oauth-provider.entity'
import { AuthMapper } from './auth.mapper'

export class AuthPoliciesOauthDrizzleHelper {
  private static get db() { return getDb() }

  static async getPasswordPolicy(tenantId: string): Promise<PasswordPolicy | null> {
    const row = await this.db.query.passwordPolicies.findFirst({
      where: eq(passwordPoliciesTable.tenantId, tenantId),
    })
    return row ? AuthMapper.passwordPolicyToDomain(row) : null
  }

  static async savePasswordPolicy(policy: PasswordPolicy): Promise<void> {
    await this.db.insert(passwordPoliciesTable).values({
      tenantId: policy.tenantId,
      minLength: policy.minLength,
      requireUppercase: policy.requireUppercase,
      requireNumbers: policy.requireNumbers,
      requireSymbols: policy.requireSymbols,
      expireDays: policy.expireDays,
      preventReuseLastN: policy.preventReuseLastN,
      updatedAt: policy.updatedAt,
    }).onConflictDoUpdate({
      target: passwordPoliciesTable.tenantId,
      set: {
        minLength: policy.minLength,
        requireUppercase: policy.requireUppercase,
        requireNumbers: policy.requireNumbers,
        requireSymbols: policy.requireSymbols,
        expireDays: policy.expireDays,
        preventReuseLastN: policy.preventReuseLastN,
        updatedAt: policy.updatedAt,
      },
    })
  }

  static async findPasswordHistoryByUser(userId: string, limit: number): Promise<PasswordHistory[]> {
    const rows = await this.db.query.passwordHistory.findMany({
      where: eq(passwordHistoryTable.userId, userId),
      limit,
      orderBy: [asc(passwordHistoryTable.createdAt)],
    })
    return rows.map((r) => AuthMapper.passwordHistoryToDomain(r))
  }

  static async savePasswordHistory(history: PasswordHistory): Promise<void> {
    await this.db.insert(passwordHistoryTable).values({
      id: history.id,
      userId: history.userId,
      passwordHash: history.passwordHash,
      createdAt: history.createdAt,
    })
  }

  static async findIpRestrictionById(id: string): Promise<IpRestriction | null> {
    const row = await this.db.query.ipRestrictions.findFirst({
      where: eq(ipRestrictionsTable.id, id),
    })
    return row ? AuthMapper.ipRestrictionToDomain(row) : null
  }

  static async listIpRestrictions(tenantId: string, userId?: string): Promise<IpRestriction[]> {
    const conditions: SQL[] = [eq(ipRestrictionsTable.tenantId, tenantId)]
    if (userId) conditions.push(eq(ipRestrictionsTable.userId, userId))
    const rows = await this.db.query.ipRestrictions.findMany({
      where: and(...conditions),
    })
    return rows.map((r) => AuthMapper.ipRestrictionToDomain(r))
  }

  static async saveIpRestriction(restriction: IpRestriction): Promise<void> {
    await this.db.insert(ipRestrictionsTable).values({
      id: restriction.id,
      tenantId: restriction.tenantId,
      userId: restriction.userId,
      ipAddress: restriction.ipAddress,
      type: restriction.type,
      description: restriction.description,
      createdAt: restriction.createdAt,
    })
  }

  static async deleteIpRestriction(id: string): Promise<void> {
    await this.db.delete(ipRestrictionsTable).where(eq(ipRestrictionsTable.id, id))
  }

  static async findOAuthProviderById(id: string): Promise<OAuthProvider | null> {
    const row = await this.db.query.oauthProviders.findFirst({
      where: eq(oauthProvidersTable.id, id),
    })
    return row ? AuthMapper.oauthProviderToDomain(row) : null
  }

  static async findOAuthProviderByName(tenantId: string, providerName: string): Promise<OAuthProvider | null> {
    const row = await this.db.query.oauthProviders.findFirst({
      where: and(
        eq(oauthProvidersTable.tenantId, tenantId),
        eq(oauthProvidersTable.providerName, providerName),
      ),
    })
    return row ? AuthMapper.oauthProviderToDomain(row) : null
  }

  static async listOAuthProviders(tenantId: string): Promise<OAuthProvider[]> {
    const rows = await this.db.query.oauthProviders.findMany({
      where: eq(oauthProvidersTable.tenantId, tenantId),
    })
    return rows.map((r) => AuthMapper.oauthProviderToDomain(r))
  }

  static async saveOAuthProvider(provider: OAuthProvider): Promise<void> {
    await this.db.insert(oauthProvidersTable).values({
      id: provider.id,
      tenantId: provider.tenantId,
      providerName: provider.providerName,
      clientId: provider.clientId,
      clientSecret: provider.clientSecret,
      isActive: provider.isActive,
      createdAt: provider.createdAt,
    })
  }

  static async deleteOAuthProvider(id: string): Promise<void> {
    await this.db.delete(oauthProvidersTable).where(eq(oauthProvidersTable.id, id))
  }
}
