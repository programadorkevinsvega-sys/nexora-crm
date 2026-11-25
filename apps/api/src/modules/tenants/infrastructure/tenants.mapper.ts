import {
  tenants, branches, tenantBranding, tenantFeatures, tenantDomains, tenantUsageMetrics,
  systemModules, installedModules, tenantTaxConfigurations, tenantLanguages, tenantCurrencies,
  tenantApiKeys, tenantWebhooks, tenantExchangeRates, tenantTranslations,
  tenantSystemAuditLogs, globalSystemParameters,
} from '@crm/database'
import { Tenant } from '../domain/entities/tenant.entity'
import { Branch } from '../domain/entities/branch.entity'
import { TenantBranding } from '../domain/entities/branding.entity'
import { TenantFeature, TenantDomain, UsageMetric } from '../domain/entities/features.entity'
import { SystemModule, InstalledModule } from '../domain/entities/modules.entity'
import {
  TaxConfiguration, TenantLanguage, TenantCurrency, TenantApiKey,
  TenantWebhook, ExchangeRate, Translation, SystemAuditLog, SystemParameter,
} from '../domain/entities/config.entity'

function jsonObjectOrNull(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) && value.every((item): item is string => typeof item === 'string')
    ? value
    : []
}

export class TenantsMapper {
  static tenantToDomain(row: typeof tenants.$inferSelect): Tenant {
    return new Tenant(
      row.id, row.name, row.legalName, row.taxId, row.taxRegime,
      row.legalAddress, row.city, row.postalCode, row.industryType,
      (row.status ?? 'ACTIVE') as Tenant['status'], row.timezone ?? 'UTC',
      row.currencyCode ?? 'USD', row.ownerUserId, row.createdAt, row.updatedAt,
    )
  }
  static tenantToPersistence(tenant: Tenant) {
    return {
      id: tenant.id, name: tenant.name, legalName: tenant.legalName, taxId: tenant.taxId,
      taxRegime: tenant.taxRegime, legalAddress: tenant.legalAddress, city: tenant.city,
      postalCode: tenant.postalCode, industryType: tenant.industryType, status: tenant.status,
      timezone: tenant.timezone, currencyCode: tenant.currencyCode, ownerUserId: tenant.ownerUserId,
      createdAt: tenant.createdAt, updatedAt: tenant.updatedAt,
    }
  }
  static tenantToResponse(tenant: Tenant) {
    return {
      id: tenant.id, name: tenant.name, legalName: tenant.legalName, taxId: tenant.taxId,
      taxRegime: tenant.taxRegime, legalAddress: tenant.legalAddress, city: tenant.city,
      postalCode: tenant.postalCode, industryType: tenant.industryType, status: tenant.status,
      timezone: tenant.timezone, currencyCode: tenant.currencyCode, ownerUserId: tenant.ownerUserId,
      createdAt: tenant.createdAt.toISOString(), updatedAt: tenant.updatedAt.toISOString(),
    }
  }

  static branchToDomain(row: typeof branches.$inferSelect): Branch {
    return new Branch(
      row.id, row.tenantId, row.name, row.code, row.address, row.city, row.country,
      row.isActive ?? true, row.isHeadquarters ?? false, row.createdAt, row.updatedAt,
    )
  }
  static branchToPersistence(branch: Branch) {
    return {
      id: branch.id, tenantId: branch.tenantId, name: branch.name, code: branch.code,
      address: branch.address, city: branch.city, country: branch.country,
      isActive: branch.isActive, isHeadquarters: branch.isHeadquarters,
      createdAt: branch.createdAt, updatedAt: branch.updatedAt,
    }
  }
  static branchToResponse(branch: Branch) {
    return {
      id: branch.id, tenantId: branch.tenantId, name: branch.name, code: branch.code,
      address: branch.address, city: branch.city, country: branch.country,
      isActive: branch.isActive, isHeadquarters: branch.isHeadquarters,
      createdAt: branch.createdAt.toISOString(), updatedAt: branch.updatedAt.toISOString(),
    }
  }

  static brandingToDomain(row: typeof tenantBranding.$inferSelect): TenantBranding {
    return new TenantBranding(
      row.tenantId, row.logoUrl, row.faviconUrl, row.primaryColor ?? '#3B82F6',
      row.secondaryColor ?? '#1E293B', row.customDomain, row.updatedAt,
    )
  }
  static brandingToResponse(branding: TenantBranding) {
    return {
      tenantId: branding.tenantId, logoUrl: branding.logoUrl, faviconUrl: branding.faviconUrl,
      primaryColor: branding.primaryColor, secondaryColor: branding.secondaryColor,
      customDomain: branding.customDomain, updatedAt: branding.updatedAt.toISOString(),
    }
  }

  static featureToDomain(row: typeof tenantFeatures.$inferSelect): TenantFeature {
    return new TenantFeature(row.tenantId, row.featureCode, row.isEnabled ?? false, row.enabledAt)
  }
  static featureToResponse(feature: TenantFeature) {
    return {
      tenantId: feature.tenantId, featureCode: feature.featureCode,
      isEnabled: feature.isEnabled, enabledAt: feature.enabledAt.toISOString(),
    }
  }

  static domainToDomain(row: typeof tenantDomains.$inferSelect): TenantDomain {
    return new TenantDomain(row.id, row.tenantId, row.domain, row.sslStatus ?? 'PENDING', row.isPrimary ?? false, row.createdAt)
  }
  static domainToResponse(domain: TenantDomain) {
    return {
      id: domain.id, tenantId: domain.tenantId, domain: domain.domain, sslStatus: domain.sslStatus,
      isPrimary: domain.isPrimary, createdAt: domain.createdAt.toISOString(),
    }
  }

  static metricToDomain(row: typeof tenantUsageMetrics.$inferSelect): UsageMetric {
    return new UsageMetric(row.id, row.tenantId, row.metricName, row.currentValue ?? 0, row.limitValue, row.periodStart, row.periodEnd, row.updatedAt)
  }
  static metricToResponse(metric: UsageMetric) {
    return {
      id: metric.id, tenantId: metric.tenantId, metricName: metric.metricName,
      currentValue: metric.currentValue, limitValue: metric.limitValue,
      periodStart: metric.periodStart.toISOString(), periodEnd: metric.periodEnd.toISOString(),
      updatedAt: metric.updatedAt.toISOString(),
    }
  }

  static sysModuleToResponse(module: SystemModule) {
    return {
      id: module.id, name: module.name, slug: module.slug, description: module.description,
      iconSvg: module.iconSvg, category: module.category, isCore: module.isCore,
      isActive: module.isActive, version: module.version,
      createdAt: module.createdAt.toISOString(), updatedAt: module.updatedAt.toISOString(),
    }
  }
  static installedModuleToResponse(module: InstalledModule) {
    return {
      id: module.id, tenantId: module.tenantId, moduleId: module.moduleId, status: module.status,
      installedAt: module.installedAt.toISOString(), configuration: module.configurationJson,
    }
  }
  static sysModuleToDomain(row: typeof systemModules.$inferSelect): SystemModule {
    return new SystemModule(
      row.id, row.name, row.slug, row.description, row.iconSvg, row.category,
      row.isCore ?? false, row.isActive ?? true, row.version ?? '1.0.0', row.createdAt, row.updatedAt,
    )
  }
  static installedModuleToDomain(row: typeof installedModules.$inferSelect): InstalledModule {
    return new InstalledModule(
      row.id, row.tenantId, row.moduleId, row.status ?? 'ACTIVE',
      row.installedAt, jsonObjectOrNull(row.configurationJson),
    )
  }

  static taxConfigToDomain(row: typeof tenantTaxConfigurations.$inferSelect): TaxConfiguration {
    return new TaxConfiguration(
      row.id, row.tenantId, row.taxName, Number(row.taxPercentage), row.description,
      row.taxType ?? 'SALES', row.isActive ?? true, row.createdAt, row.updatedAt,
    )
  }
  static taxConfigToResponse(config: TaxConfiguration) {
    return {
      id: config.id, tenantId: config.tenantId, taxName: config.taxName,
      taxPercentage: config.taxPercentage, description: config.description,
      taxType: config.taxType, isActive: config.isActive,
      createdAt: config.createdAt.toISOString(), updatedAt: config.updatedAt.toISOString(),
    }
  }

  static languageToDomain(row: typeof tenantLanguages.$inferSelect): TenantLanguage {
    return new TenantLanguage(
      row.id, row.tenantId, row.isoCode, row.name, row.isDefault ?? false,
      row.isActive ?? true, row.createdAt, row.updatedAt,
    )
  }
  static languageToResponse(language: TenantLanguage) {
    return {
      id: language.id, tenantId: language.tenantId, isoCode: language.isoCode, name: language.name,
      isDefault: language.isDefault, isActive: language.isActive,
      createdAt: language.createdAt.toISOString(), updatedAt: language.updatedAt.toISOString(),
    }
  }

  static currencyToDomain(row: typeof tenantCurrencies.$inferSelect): TenantCurrency {
    return new TenantCurrency(
      row.id, row.tenantId, row.isoCode, row.name, row.symbol,
      row.isBaseCurrency ?? false, row.isActive ?? true, row.createdAt, row.updatedAt,
    )
  }
  static currencyToResponse(currency: TenantCurrency) {
    return {
      id: currency.id, tenantId: currency.tenantId, isoCode: currency.isoCode,
      name: currency.name, symbol: currency.symbol, isBaseCurrency: currency.isBaseCurrency,
      isActive: currency.isActive, createdAt: currency.createdAt.toISOString(),
      updatedAt: currency.updatedAt.toISOString(),
    }
  }

  static apiKeyToDomain(row: typeof tenantApiKeys.$inferSelect): TenantApiKey {
    return new TenantApiKey(
      row.id, row.tenantId, row.name, row.tokenHash, row.lastFourChars,
      stringArray(row.scopesJson), row.expiresAt, row.lastUsedAt, row.isActive ?? true,
      row.createdAt, row.updatedAt,
    )
  }
  static apiKeyToResponse(key: TenantApiKey) {
    return {
      id: key.id, tenantId: key.tenantId, name: key.name, lastFourChars: key.lastFourChars,
      scopes: key.scopesJson, expiresAt: key.expiresAt?.toISOString() ?? null,
      lastUsedAt: key.lastUsedAt?.toISOString() ?? null, isActive: key.isActive,
      createdAt: key.createdAt.toISOString(), updatedAt: key.updatedAt.toISOString(),
    }
  }

  static webhookToDomain(row: typeof tenantWebhooks.$inferSelect): TenantWebhook {
    return new TenantWebhook(
      row.id, row.tenantId, row.name, row.endpointUrl, row.secretKey,
      row.isActive ?? true, row.maxRetries ?? 3, [], row.createdAt, row.updatedAt,
    )
  }
  static webhookToResponse(webhook: TenantWebhook) {
    return {
      id: webhook.id, tenantId: webhook.tenantId, name: webhook.name, endpointUrl: webhook.endpointUrl,
      isActive: webhook.isActive, maxRetries: webhook.maxRetries,
      createdAt: webhook.createdAt.toISOString(), updatedAt: webhook.updatedAt.toISOString(),
    }
  }

  static exchangeRateToDomain(row: typeof tenantExchangeRates.$inferSelect): ExchangeRate {
    return new ExchangeRate(
      row.id, row.tenantId, row.fromCurrencyId, row.toCurrencyId,
      Number(row.rate), row.effectiveDate, row.createdAt,
    )
  }
  static exchangeRateToResponse(rate: ExchangeRate) {
    return {
      id: rate.id, tenantId: rate.tenantId, fromCurrencyId: rate.fromCurrencyId,
      toCurrencyId: rate.toCurrencyId, rate: rate.rate,
      effectiveDate: rate.effectiveDate.toISOString(), createdAt: rate.createdAt.toISOString(),
    }
  }

  static translationToDomain(row: typeof tenantTranslations.$inferSelect): Translation {
    return new Translation(
      row.id, row.tenantId, row.languageId, row.translationKey, row.translationValue, row.createdAt,
    )
  }
  static translationToResponse(translation: Translation) {
    return {
      id: translation.id, tenantId: translation.tenantId, languageId: translation.languageId,
      translationKey: translation.translationKey, translationValue: translation.translationValue,
      createdAt: translation.createdAt.toISOString(),
    }
  }

  static auditLogToDomain(row: typeof tenantSystemAuditLogs.$inferSelect): SystemAuditLog {
    return new SystemAuditLog(
      row.id, row.tenantId, row.userId, row.moduleName, row.actionType, row.entityName,
      row.entityId, jsonObjectOrNull(row.oldValuesJson), jsonObjectOrNull(row.newValuesJson),
      row.ipAddress, row.userAgent, row.createdAt,
    )
  }
  static auditLogToResponse(log: SystemAuditLog) {
    return {
      id: log.id, tenantId: log.tenantId, userId: log.userId, moduleName: log.moduleName,
      actionType: log.actionType, entityName: log.entityName, entityId: log.entityId,
      oldValues: log.oldValues, newValues: log.newValues,
      ipAddress: log.ipAddress, userAgent: log.userAgent, createdAt: log.createdAt.toISOString(),
    }
  }

  static sysParamToDomain(row: typeof globalSystemParameters.$inferSelect): SystemParameter {
    return new SystemParameter(
      row.paramKey, row.paramValue, row.description, row.dataType ?? 'STRING',
      row.isPublic ?? false, row.createdAt, row.updatedAt,
    )
  }
  static sysParamToResponse(parameter: SystemParameter) {
    return {
      paramKey: parameter.paramKey, paramValue: parameter.paramValue,
      description: parameter.description, dataType: parameter.dataType,
      isPublic: parameter.isPublic, createdAt: parameter.createdAt.toISOString(),
      updatedAt: parameter.updatedAt.toISOString(),
    }
  }
}
