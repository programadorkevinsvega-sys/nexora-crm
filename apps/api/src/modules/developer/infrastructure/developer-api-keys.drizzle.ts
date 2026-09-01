import { eq, and, desc } from 'drizzle-orm'
import { getDb, apiKeys } from '@crm/database'
import { ApiKey, ApiKeyScope } from '../domain/entities/api-key.entity'

export class DeveloperApiKeysDrizzleHelper {
  private static get db() { return getDb() }

  static async createApiKey(
    tenantId: string,
    name: string,
    scopes: ApiKeyScope[],
    rawKey: string,
    expiresAt?: Date | null,
  ): Promise<ApiKey> {
    const key = ApiKey.create({ tenantId, name, scopes, rawKey, expiresAt })
    await this.db.insert(apiKeys).values({
      id: key.id,
      tenantId: key.tenantId,
      name: key.name,
      keyHash: key.keyHash,
      keyPrefix: key.keyPrefix,
      scopes: key.scopes,
      isActive: key.isActive,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
    })
    return key
  }

  static async listApiKeys(tenantId: string): Promise<ApiKey[]> {
    const rows = await this.db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.tenantId, tenantId))
      .orderBy(desc(apiKeys.createdAt))

    return rows.map(
      (r) =>
        new ApiKey(
          r.id,
          r.tenantId,
          r.name,
          r.keyHash,
          r.keyPrefix,
          r.scopes as ApiKeyScope[],
          r.isActive,
          r.lastUsedAt,
          r.expiresAt,
          r.createdAt,
          r.updatedAt,
        ),
    )
  }

  static async revokeApiKey(tenantId: string, id: string): Promise<void> {
    await this.db
      .update(apiKeys)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(apiKeys.tenantId, tenantId), eq(apiKeys.id, id)))
  }

  static async deleteApiKey(tenantId: string, id: string): Promise<void> {
    await this.db
      .delete(apiKeys)
      .where(and(eq(apiKeys.tenantId, tenantId), eq(apiKeys.id, id)))
  }

  static async validateApiKey(
    rawKey: string,
  ): Promise<
    | { valid: true; tenantId: string; scopes: ApiKeyScope[]; keyId: string }
    | { valid: false }
  > {
    const hash = ApiKey.hashKey(rawKey)
    const rows = await this.db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.keyHash, hash), eq(apiKeys.isActive, true)))
      .limit(1)

    if (rows.length === 0) return { valid: false }
    const row = rows[0]

    if (row.expiresAt && new Date() > new Date(row.expiresAt)) {
      return { valid: false }
    }

    return {
      valid: true,
      tenantId: row.tenantId,
      scopes: row.scopes as ApiKeyScope[],
      keyId: row.id,
    }
  }

  static async markKeyUsed(keyId: string): Promise<void> {
    await this.db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, keyId))
  }
}
