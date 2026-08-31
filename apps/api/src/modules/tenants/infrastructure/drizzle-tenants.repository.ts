/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common'
import { eq, and, ilike, gt, asc } from 'drizzle-orm'
import { getDb } from '@crm/database'
import {
  tenants as tenantsTable, branches as branchesTable,
  tenantBranding as brandingTable, tenantFeatures as featuresTable,
  tenantDomains as domainsTable, tenantUsageMetrics as metricsTable,
  systemModules as sysModulesTable, installedModules as installedModulesTable,
  tenantTaxConfigurations as taxConfigsTable,
  tenantLanguages as languagesTable, tenantCurrencies as currenciesTable,
  tenantApiKeys as apiKeysTable, tenantWebhooks as webhooksTable,
  tenantExchangeRates as exchangeRatesTable,
  tenantTranslations as translationsTable,
  tenantSystemAuditLogs as auditLogsTable,
  globalSystemParameters as sysParamsTable,
} from '@crm/database'
import { TenantsRepository, PaginatedTenants } from '../domain/repositories/tenants.repository'
import { Tenant } from '../domain/entities/tenant.entity'
import { Branch } from '../domain/entities/branch.entity'
import { TenantBranding } from '../domain/entities/branding.entity'
import { TenantFeature, TenantDomain, UsageMetric } from '../domain/entities/features.entity'
import { SystemModule, InstalledModule } from '../domain/entities/modules.entity'
import {
  TaxConfiguration, TenantLanguage, TenantCurrency, TenantApiKey,
  TenantWebhook, ExchangeRate, Translation, SystemAuditLog, SystemParameter,
} from '../domain/entities/config.entity'
import { TenantsMapper } from './tenants.mapper'

@Injectable()
export class DrizzleTenantsRepository extends TenantsRepository {
  private get db() { return getDb() }

  // ── Tenants ──

  async findTenantById(id: string): Promise<Tenant | null> {
    const row = await this.db.query.tenants.findFirst({ where: eq(tenantsTable.id, id) as any })
    return row ? TenantsMapper.tenantToDomain(row as any) : null
  }

  async listTenants(search?: string, status?: string, cursor?: string, limit = 20): Promise<PaginatedTenants> {
    const conditions: any[] = []
    if (cursor) conditions.push(gt(tenantsTable.createdAt, new Date(cursor)))
    if (search) conditions.push(ilike(tenantsTable.name, `%${search}%`) as any)
    if (status) conditions.push(eq(tenantsTable.status, status) as any)

    const rows = await this.db.query.tenants.findMany({
      where: conditions.length ? and(...conditions) as any : undefined,
      limit: limit + 1, orderBy: [asc(tenantsTable.createdAt), asc(tenantsTable.id)],
    })
    const hasMore = rows.length > limit
    const data = hasMore ? rows.slice(0, limit) : rows
    return {
      data: data.map(r => TenantsMapper.tenantToDomain(r as any)),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  async saveTenant(tenant: Tenant): Promise<void> {
    const row = TenantsMapper.tenantToPersistence(tenant)
    await this.db.insert(tenantsTable).values(row as any).onConflictDoUpdate({
      target: tenantsTable.id, set: row as any,
    })
  }

  async deleteTenant(id: string): Promise<void> {
    await this.db.delete(branchesTable).where(eq(branchesTable.tenantId, id) as any)
    await this.db.delete(featuresTable).where(eq(featuresTable.tenantId, id) as any)
    await this.db.delete(domainsTable).where(eq(domainsTable.tenantId, id) as any)
    await this.db.delete(metricsTable).where(eq(metricsTable.tenantId, id) as any)
    await this.db.delete(installedModulesTable).where(eq(installedModulesTable.tenantId, id) as any)
    await this.db.delete(brandingTable).where(eq(brandingTable.tenantId, id) as any)
    await this.db.delete(tenantsTable).where(eq(tenantsTable.id, id) as any)
  }

  // ── Branches ──

  async findBranchById(id: string): Promise<Branch | null> {
    const row = await this.db.query.branches.findFirst({ where: eq(branchesTable.id, id) as any })
    return row ? TenantsMapper.branchToDomain(row as any) : null
  }

  async listBranches(tenantId: string): Promise<Branch[]> {
    const rows = await this.db.query.branches.findMany({
      where: eq(branchesTable.tenantId, tenantId) as any,
      orderBy: [asc(branchesTable.name)],
    })
    return rows.map(r => TenantsMapper.branchToDomain(r as any))
  }

  async saveBranch(branch: Branch): Promise<void> {
    const row = TenantsMapper.branchToPersistence(branch)
    await this.db.insert(branchesTable).values(row as any).onConflictDoUpdate({
      target: branchesTable.id, set: row as any,
    })
  }

  async deleteBranch(tenantId: string, id: string): Promise<void> {
    await this.db.delete(branchesTable).where(
      and(eq(branchesTable.tenantId, tenantId), eq(branchesTable.id, id)) as any,
    )
  }

  // ── Branding ──

  async findBranding(tenantId: string): Promise<TenantBranding | null> {
    const row = await this.db.query.tenantBranding.findFirst({
      where: eq(brandingTable.tenantId, tenantId) as any,
    })
    return row ? TenantsMapper.brandingToDomain(row as any) : null
  }

  async saveBranding(branding: TenantBranding): Promise<void> {
    await this.db.insert(brandingTable).values({
      tenantId: branding.tenantId, logoUrl: branding.logoUrl,
      faviconUrl: branding.faviconUrl, primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor, customDomain: branding.customDomain,
      updatedAt: branding.updatedAt,
    } as any).onConflictDoUpdate({
      target: brandingTable.tenantId, set: {
        logoUrl: branding.logoUrl, faviconUrl: branding.faviconUrl,
        primaryColor: branding.primaryColor, secondaryColor: branding.secondaryColor,
        customDomain: branding.customDomain, updatedAt: branding.updatedAt,
      } as any,
    })
  }

  // ── Features ──

  async listFeatures(tenantId: string): Promise<TenantFeature[]> {
    const rows = await this.db.query.tenantFeatures.findMany({
      where: eq(featuresTable.tenantId, tenantId) as any,
    })
    return rows.map(r => new TenantFeature(r.tenantId, r.featureCode, r.isEnabled ?? true, r.enabledAt))
  }

  async toggleFeature(tenantId: string, featureCode: string, isEnabled: boolean): Promise<void> {
    await this.db.insert(featuresTable).values({
      tenantId, featureCode, isEnabled, enabledAt: new Date(),
    } as any).onConflictDoUpdate({
      target: [featuresTable.tenantId, featuresTable.featureCode] as any,
      set: { isEnabled, enabledAt: new Date() } as any,
    })
  }

  // ── Domains ──

  async findDomainById(id: string): Promise<TenantDomain | null> {
    const row = await this.db.query.tenantDomains.findFirst({ where: eq(domainsTable.id, id) as any })
    if (!row) return null
    return new TenantDomain(row.id, row.tenantId, row.domain, row.sslStatus ?? 'PENDING', row.isPrimary ?? false, row.createdAt)
  }

  async listDomains(tenantId: string): Promise<TenantDomain[]> {
    const rows = await this.db.query.tenantDomains.findMany({
      where: eq(domainsTable.tenantId, tenantId) as any,
    })
    return rows.map(r => new TenantDomain(r.id, r.tenantId, r.domain, r.sslStatus ?? 'PENDING', r.isPrimary ?? false, r.createdAt))
  }

  async saveDomain(domain: TenantDomain): Promise<void> {
    await this.db.insert(domainsTable).values({
      id: domain.id, tenantId: domain.tenantId, domain: domain.domain,
      sslStatus: domain.sslStatus, isPrimary: domain.isPrimary, createdAt: domain.createdAt,
    } as any).onConflictDoNothing()
  }

  async deleteDomain(tenantId: string, id: string): Promise<void> {
    await this.db.delete(domainsTable).where(
      and(eq(domainsTable.tenantId, tenantId), eq(domainsTable.id, id)) as any,
    )
  }

  async setPrimaryDomain(tenantId: string, domainId: string): Promise<void> {
    const all = await this.listDomains(tenantId)
    for (const d of all) {
      if (d.isPrimary) {
        await this.db.update(domainsTable).set({ isPrimary: false } as any)
          .where(and(eq(domainsTable.tenantId, tenantId), eq(domainsTable.id, d.id)) as any)
      }
    }
    if (domainId) {
      await this.db.update(domainsTable).set({ isPrimary: true } as any)
        .where(and(eq(domainsTable.tenantId, tenantId), eq(domainsTable.id, domainId)) as any)
    }
  }

  // ── Usage metrics ──

  async listMetrics(tenantId: string): Promise<UsageMetric[]> {
    const rows = await this.db.query.tenantUsageMetrics.findMany({
      where: eq(metricsTable.tenantId, tenantId) as any,
    })
    return rows.map(r => new UsageMetric(r.id, r.tenantId, r.metricName, r.currentValue,
      r.limitValue, r.periodStart, r.periodEnd, r.updatedAt))
  }

  async upsertMetric(metric: UsageMetric): Promise<void> {
    await this.db.insert(metricsTable).values({
      id: metric.id, tenantId: metric.tenantId, metricName: metric.metricName,
      currentValue: metric.currentValue, limitValue: metric.limitValue,
      periodStart: metric.periodStart, periodEnd: metric.periodEnd, updatedAt: metric.updatedAt,
    } as any).onConflictDoUpdate({
      target: metricsTable.id, set: { currentValue: metric.currentValue, limitValue: metric.limitValue, updatedAt: metric.updatedAt } as any,
    })
  }

  // ── System modules ──

  async listSystemModules(category?: string): Promise<SystemModule[]> {
    const conditions: any[] = []
    if (category) conditions.push(eq(sysModulesTable.category, category) as any)
    const rows = await this.db.query.systemModules.findMany({
      where: conditions.length ? and(...conditions) as any : undefined,
      orderBy: [asc(sysModulesTable.name)],
    })
    return rows.map(r => TenantsMapper.sysModuleToDomain(r as any))
  }

  async findSystemModuleById(id: string): Promise<SystemModule | null> {
    const row = await this.db.query.systemModules.findFirst({ where: eq(sysModulesTable.id, id) as any })
    return row ? TenantsMapper.sysModuleToDomain(row as any) : null
  }

  async saveSystemModule(module: SystemModule): Promise<void> {
    await this.db.insert(sysModulesTable).values({
      id: module.id, name: module.name, slug: module.slug, description: module.description,
      iconSvg: module.iconSvg, category: module.category, isCore: module.isCore,
      isActive: module.isActive, version: module.version, createdAt: module.createdAt, updatedAt: module.updatedAt,
    } as any).onConflictDoUpdate({
      target: sysModulesTable.id, set: { name: module.name, updatedAt: module.updatedAt } as any,
    })
  }

  // ── Installed modules ──

  async listInstalledModules(tenantId: string): Promise<InstalledModule[]> {
    const rows = await this.db.query.installedModules.findMany({
      where: eq(installedModulesTable.tenantId, tenantId) as any,
    })
    return rows.map(r => TenantsMapper.installedModuleToDomain(r as any))
  }

  async findInstalledModule(tenantId: string, moduleId: string): Promise<InstalledModule | null> {
    const row = await this.db.query.installedModules.findFirst({
      where: and(
        eq(installedModulesTable.tenantId, tenantId) as any,
        eq(installedModulesTable.moduleId, moduleId) as any,
      ) as any,
    })
    return row ? TenantsMapper.installedModuleToDomain(row as any) : null
  }

  async installModule(installed: InstalledModule): Promise<void> {
    await this.db.insert(installedModulesTable).values({
      id: installed.id, tenantId: installed.tenantId, moduleId: installed.moduleId,
      status: installed.status, installedAt: installed.installedAt,
      configurationJson: installed.configurationJson,
    } as any).onConflictDoNothing()
  }

  async uninstallModule(tenantId: string, moduleId: string): Promise<void> {
    await this.db.delete(installedModulesTable).where(
      and(
        eq(installedModulesTable.tenantId, tenantId) as any,
        eq(installedModulesTable.moduleId, moduleId) as any,
      ) as any,
    )
  }

  // ── Tax configurations ──

  async listTaxConfigs(tenantId: string): Promise<TaxConfiguration[]> {
    const rows = await this.db.query.tenantTaxConfigurations.findMany({
      where: eq(taxConfigsTable.tenantId, tenantId) as any,
    })
    return rows.map(r => TenantsMapper.taxConfigToDomain(r as any))
  }

  async findTaxConfigById(id: string): Promise<TaxConfiguration | null> {
    const row = await this.db.query.tenantTaxConfigurations.findFirst({ where: eq(taxConfigsTable.id, id) as any })
    return row ? TenantsMapper.taxConfigToDomain(row as any) : null
  }

  async saveTaxConfig(config: TaxConfiguration): Promise<void> {
    await this.db.insert(taxConfigsTable).values({
      id: config.id, tenantId: config.tenantId, taxName: config.taxName,
      taxPercentage: String(config.taxPercentage), description: config.description,
      taxType: config.taxType, isActive: config.isActive,
      createdAt: config.createdAt, updatedAt: config.updatedAt,
    } as any).onConflictDoUpdate({
      target: taxConfigsTable.id, set: { taxName: config.taxName, taxPercentage: String(config.taxPercentage), updatedAt: config.updatedAt } as any,
    })
  }

  async deleteTaxConfig(tenantId: string, id: string): Promise<void> {
    await this.db.delete(taxConfigsTable).where(and(eq(taxConfigsTable.tenantId, tenantId), eq(taxConfigsTable.id, id)) as any)
  }

  // ── Languages ──

  async listLanguages(tenantId: string): Promise<TenantLanguage[]> {
    const rows = await this.db.query.tenantLanguages.findMany({ where: eq(languagesTable.tenantId, tenantId) as any })
    return rows.map(r => TenantsMapper.languageToDomain(r as any))
  }

  async findLanguageById(id: string): Promise<TenantLanguage | null> {
    const row = await this.db.query.tenantLanguages.findFirst({ where: eq(languagesTable.id, id) as any })
    return row ? TenantsMapper.languageToDomain(row as any) : null
  }

  async saveLanguage(lang: TenantLanguage): Promise<void> {
    await this.db.insert(languagesTable).values({
      id: lang.id, tenantId: lang.tenantId, isoCode: lang.isoCode, name: lang.name,
      isDefault: lang.isDefault, isActive: lang.isActive,
      createdAt: lang.createdAt, updatedAt: lang.updatedAt,
    } as any).onConflictDoUpdate({
      target: languagesTable.id, set: { name: lang.name, isActive: lang.isActive, updatedAt: lang.updatedAt } as any,
    })
  }

  async deleteLanguage(tenantId: string, id: string): Promise<void> {
    await this.db.delete(languagesTable).where(and(eq(languagesTable.tenantId, tenantId), eq(languagesTable.id, id)) as any)
  }

  async setDefaultLanguage(tenantId: string, languageId: string): Promise<void> {
    await this.db.update(languagesTable).set({ isDefault: false } as any)
      .where(eq(languagesTable.tenantId, tenantId) as any)
    await this.db.update(languagesTable).set({ isDefault: true } as any)
      .where(and(eq(languagesTable.tenantId, tenantId), eq(languagesTable.id, languageId)) as any)
  }

  // ── Currencies ──

  async listCurrencies(tenantId: string): Promise<TenantCurrency[]> {
    const rows = await this.db.query.tenantCurrencies.findMany({ where: eq(currenciesTable.tenantId, tenantId) as any })
    return rows.map(r => TenantsMapper.currencyToDomain(r as any))
  }

  async findCurrencyById(id: string): Promise<TenantCurrency | null> {
    const row = await this.db.query.tenantCurrencies.findFirst({ where: eq(currenciesTable.id, id) as any })
    return row ? TenantsMapper.currencyToDomain(row as any) : null
  }

  async saveCurrency(curr: TenantCurrency): Promise<void> {
    await this.db.insert(currenciesTable).values({
      id: curr.id, tenantId: curr.tenantId, isoCode: curr.isoCode, name: curr.name,
      symbol: curr.symbol, isBaseCurrency: curr.isBaseCurrency, isActive: curr.isActive,
      createdAt: curr.createdAt, updatedAt: curr.updatedAt,
    } as any).onConflictDoUpdate({
      target: currenciesTable.id, set: { name: curr.name, symbol: curr.symbol, updatedAt: curr.updatedAt } as any,
    })
  }

  async deleteCurrency(tenantId: string, id: string): Promise<void> {
    await this.db.delete(currenciesTable).where(and(eq(currenciesTable.tenantId, tenantId), eq(currenciesTable.id, id)) as any)
  }

  async setBaseCurrency(tenantId: string, currencyId: string): Promise<void> {
    await this.db.update(currenciesTable).set({ isBaseCurrency: false } as any)
      .where(eq(currenciesTable.tenantId, tenantId) as any)
    await this.db.update(currenciesTable).set({ isBaseCurrency: true } as any)
      .where(and(eq(currenciesTable.tenantId, tenantId), eq(currenciesTable.id, currencyId)) as any)
  }

  // ── API Keys ──

  async listApiKeys(tenantId: string): Promise<TenantApiKey[]> {
    const rows = await this.db.query.tenantApiKeys.findMany({ where: eq(apiKeysTable.tenantId, tenantId) as any })
    return rows.map(r => TenantsMapper.apiKeyToDomain(r as any))
  }

  async findApiKeyById(id: string): Promise<TenantApiKey | null> {
    const row = await this.db.query.tenantApiKeys.findFirst({ where: eq(apiKeysTable.id, id) as any })
    return row ? TenantsMapper.apiKeyToDomain(row as any) : null
  }

  async saveApiKey(key: TenantApiKey): Promise<void> {
    await this.db.insert(apiKeysTable).values({
      id: key.id, tenantId: key.tenantId, name: key.name,
      tokenHash: key.tokenHash, lastFourChars: key.lastFourChars,
      scopesJson: key.scopesJson, expiresAt: key.expiresAt,
      lastUsedAt: key.lastUsedAt, isActive: key.isActive,
      createdAt: key.createdAt, updatedAt: key.updatedAt,
    } as any).onConflictDoUpdate({
      target: apiKeysTable.id, set: { name: key.name, updatedAt: key.updatedAt } as any,
    })
  }

  async revokeApiKey(tenantId: string, id: string): Promise<void> {
    await this.db.update(apiKeysTable).set({ isActive: false, updatedAt: new Date() } as any)
      .where(and(eq(apiKeysTable.tenantId, tenantId), eq(apiKeysTable.id, id)) as any)
  }

  // ── Webhooks ──

  async listWebhooks(tenantId: string): Promise<TenantWebhook[]> {
    const rows = await this.db.query.tenantWebhooks.findMany({ where: eq(webhooksTable.tenantId, tenantId) as any })
    return rows.map(r => TenantsMapper.webhookToDomain(r as any))
  }

  async findWebhookById(id: string): Promise<TenantWebhook | null> {
    const row = await this.db.query.tenantWebhooks.findFirst({ where: eq(webhooksTable.id, id) as any })
    return row ? TenantsMapper.webhookToDomain(row as any) : null
  }

  async saveWebhook(webhook: TenantWebhook): Promise<void> {
    await this.db.insert(webhooksTable).values({
      id: webhook.id, tenantId: webhook.tenantId, name: webhook.name,
      endpointUrl: webhook.endpointUrl, secretKey: webhook.secretKey,
      isActive: webhook.isActive, maxRetries: webhook.maxRetries,
      createdAt: webhook.createdAt, updatedAt: webhook.updatedAt,
    } as any).onConflictDoUpdate({
      target: webhooksTable.id, set: { name: webhook.name, endpointUrl: webhook.endpointUrl, updatedAt: webhook.updatedAt } as any,
    })
  }

  async deleteWebhook(tenantId: string, id: string): Promise<void> {
    await this.db.delete(webhooksTable).where(and(eq(webhooksTable.tenantId, tenantId), eq(webhooksTable.id, id)) as any)
  }

  // ── Exchange rates ──

  async listExchangeRates(tenantId: string): Promise<ExchangeRate[]> {
    const rows = await this.db.query.tenantExchangeRates.findMany({ where: eq(exchangeRatesTable.tenantId, tenantId) as any })
    return rows.map(r => TenantsMapper.exchangeRateToDomain(r as any))
  }

  async saveExchangeRate(rate: ExchangeRate): Promise<void> {
    await this.db.insert(exchangeRatesTable).values({
      id: rate.id, tenantId: rate.tenantId, fromCurrencyId: rate.fromCurrencyId,
      toCurrencyId: rate.toCurrencyId, rate: String(rate.rate),
      effectiveDate: rate.effectiveDate, createdAt: rate.createdAt,
    } as any).onConflictDoNothing()
  }

  // ── Translations ──

  async listTranslations(tenantId: string, languageId?: string): Promise<Translation[]> {
    const conditions: any[] = [eq(translationsTable.tenantId, tenantId)]
    if (languageId) conditions.push(eq(translationsTable.languageId, languageId))
    const rows = await this.db.query.tenantTranslations.findMany({
      where: and(...conditions) as any,
    })
    return rows.map(r => TenantsMapper.translationToDomain(r as any))
  }

  async findTranslationById(id: string): Promise<Translation | null> {
    const row = await this.db.query.tenantTranslations.findFirst({ where: eq(translationsTable.id, id) as any })
    return row ? TenantsMapper.translationToDomain(row as any) : null
  }

  async saveTranslation(t: Translation): Promise<void> {
    await this.db.insert(translationsTable).values({
      id: t.id, tenantId: t.tenantId, languageId: t.languageId,
      translationKey: t.translationKey, translationValue: t.translationValue,
      createdAt: t.createdAt,
    } as any).onConflictDoUpdate({
      target: translationsTable.id, set: { translationValue: t.translationValue } as any,
    })
  }

  async deleteTranslation(tenantId: string, id: string): Promise<void> {
    await this.db.delete(translationsTable).where(and(eq(translationsTable.tenantId, tenantId), eq(translationsTable.id, id)) as any)
  }

  // ── Audit logs ──

  async listAuditLogs(tenantId: string, moduleName?: string, cursor?: string, limit = 20): Promise<{ data: SystemAuditLog[]; nextCursor: string | null }> {
    const conditions: any[] = [eq(auditLogsTable.tenantId, tenantId)]
    if (cursor) conditions.push(gt(auditLogsTable.createdAt, new Date(cursor)))
    if (moduleName) conditions.push(eq(auditLogsTable.moduleName, moduleName))
    const rows = await this.db.query.tenantSystemAuditLogs.findMany({
      where: and(...conditions) as any, limit: limit + 1, orderBy: [asc(auditLogsTable.createdAt)],
    })
    const hasMore = rows.length > limit
    const data = hasMore ? rows.slice(0, limit) : rows
    return {
      data: data.map(r => TenantsMapper.auditLogToDomain(r as any)),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  // ── System parameters ──

  async getParameter(paramKey: string): Promise<SystemParameter | null> {
    const row = await this.db.query.globalSystemParameters.findFirst({ where: eq(sysParamsTable.paramKey, paramKey) as any })
    return row ? TenantsMapper.sysParamToDomain(row as any) : null
  }

  async setParameter(param: SystemParameter): Promise<void> {
    await this.db.insert(sysParamsTable).values({
      paramKey: param.paramKey, paramValue: param.paramValue,
      description: param.description, dataType: param.dataType,
      isPublic: param.isPublic, createdAt: param.createdAt, updatedAt: param.updatedAt,
    } as any).onConflictDoUpdate({
      target: sysParamsTable.paramKey, set: { paramValue: param.paramValue, updatedAt: param.updatedAt } as any,
    })
  }
}
