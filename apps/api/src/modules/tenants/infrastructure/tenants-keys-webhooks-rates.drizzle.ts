/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq, and } from 'drizzle-orm'
import {
  getDb,
  tenantApiKeys as apiKeysTable,
  tenantWebhooks as webhooksTable,
  tenantExchangeRates as exchangeRatesTable,
  tenantTranslations as translationsTable,
} from '@crm/database'
import {
  TenantApiKey, TenantWebhook, ExchangeRate, Translation,
} from '../domain/entities/config.entity'
import { TenantsMapper } from './tenants.mapper'

export class TenantsKeysWebhooksRatesDrizzleHelper {
  private static get db() { return getDb() }

  static async listApiKeys(tenantId: string): Promise<TenantApiKey[]> {
    const rows = await this.db.query.tenantApiKeys.findMany({ where: eq(apiKeysTable.tenantId, tenantId) as any })
    return rows.map((r) => TenantsMapper.apiKeyToDomain(r as any))
  }

  static async findApiKeyById(id: string): Promise<TenantApiKey | null> {
    const row = await this.db.query.tenantApiKeys.findFirst({ where: eq(apiKeysTable.id, id) as any })
    return row ? TenantsMapper.apiKeyToDomain(row as any) : null
  }

  static async saveApiKey(key: TenantApiKey): Promise<void> {
    await this.db.insert(apiKeysTable).values({
      id: key.id,
      tenantId: key.tenantId,
      name: key.name,
      tokenHash: key.tokenHash,
      lastFourChars: key.lastFourChars,
      scopesJson: key.scopesJson,
      expiresAt: key.expiresAt,
      lastUsedAt: key.lastUsedAt,
      isActive: key.isActive,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
    } as any).onConflictDoUpdate({
      target: apiKeysTable.id,
      set: { name: key.name, updatedAt: key.updatedAt } as any,
    })
  }

  static async revokeApiKey(tenantId: string, id: string): Promise<void> {
    await this.db.update(apiKeysTable).set({ isActive: false, updatedAt: new Date() } as any)
      .where(and(eq(apiKeysTable.tenantId, tenantId), eq(apiKeysTable.id, id)) as any)
  }

  static async listWebhooks(tenantId: string): Promise<TenantWebhook[]> {
    const rows = await this.db.query.tenantWebhooks.findMany({ where: eq(webhooksTable.tenantId, tenantId) as any })
    return rows.map((r) => TenantsMapper.webhookToDomain(r as any))
  }

  static async findWebhookById(id: string): Promise<TenantWebhook | null> {
    const row = await this.db.query.tenantWebhooks.findFirst({ where: eq(webhooksTable.id, id) as any })
    return row ? TenantsMapper.webhookToDomain(row as any) : null
  }

  static async saveWebhook(webhook: TenantWebhook): Promise<void> {
    await this.db.insert(webhooksTable).values({
      id: webhook.id,
      tenantId: webhook.tenantId,
      name: webhook.name,
      endpointUrl: webhook.endpointUrl,
      secretKey: webhook.secretKey,
      isActive: webhook.isActive,
      maxRetries: webhook.maxRetries,
      createdAt: webhook.createdAt,
      updatedAt: webhook.updatedAt,
    } as any).onConflictDoUpdate({
      target: webhooksTable.id,
      set: { name: webhook.name, endpointUrl: webhook.endpointUrl, updatedAt: webhook.updatedAt } as any,
    })
  }

  static async deleteWebhook(tenantId: string, id: string): Promise<void> {
    await this.db.delete(webhooksTable).where(and(eq(webhooksTable.tenantId, tenantId), eq(webhooksTable.id, id)) as any)
  }

  static async listExchangeRates(tenantId: string): Promise<ExchangeRate[]> {
    const rows = await this.db.query.tenantExchangeRates.findMany({ where: eq(exchangeRatesTable.tenantId, tenantId) as any })
    return rows.map((r) => TenantsMapper.exchangeRateToDomain(r as any))
  }

  static async saveExchangeRate(rate: ExchangeRate): Promise<void> {
    await this.db.insert(exchangeRatesTable).values({
      id: rate.id,
      tenantId: rate.tenantId,
      fromCurrencyId: rate.fromCurrencyId,
      toCurrencyId: rate.toCurrencyId,
      rate: String(rate.rate),
      effectiveDate: rate.effectiveDate,
      createdAt: rate.createdAt,
    } as any).onConflictDoNothing()
  }

  static async listTranslations(tenantId: string, languageId?: string): Promise<Translation[]> {
    const conditions: any[] = [eq(translationsTable.tenantId, tenantId)]
    if (languageId) conditions.push(eq(translationsTable.languageId, languageId))
    const rows = await this.db.query.tenantTranslations.findMany({
      where: and(...conditions) as any,
    })
    return rows.map((r) => TenantsMapper.translationToDomain(r as any))
  }

  static async findTranslationById(id: string): Promise<Translation | null> {
    const row = await this.db.query.tenantTranslations.findFirst({ where: eq(translationsTable.id, id) as any })
    return row ? TenantsMapper.translationToDomain(row as any) : null
  }

  static async saveTranslation(t: Translation): Promise<void> {
    await this.db.insert(translationsTable).values({
      id: t.id,
      tenantId: t.tenantId,
      languageId: t.languageId,
      translationKey: t.translationKey,
      translationValue: t.translationValue,
      createdAt: t.createdAt,
    } as any).onConflictDoUpdate({
      target: translationsTable.id,
      set: { translationValue: t.translationValue } as any,
    })
  }

  static async deleteTranslation(tenantId: string, id: string): Promise<void> {
    await this.db.delete(translationsTable).where(and(eq(translationsTable.tenantId, tenantId), eq(translationsTable.id, id)) as any)
  }
}
