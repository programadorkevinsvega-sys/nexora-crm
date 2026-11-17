import { Tenant } from '../domain/entities/tenant.entity'
import { Branch } from '../domain/entities/branch.entity'
import { TenantBranding } from '../domain/entities/branding.entity'
import { TenantFeature, TenantDomain, UsageMetric } from '../domain/entities/features.entity'
import { SystemModule, InstalledModule } from '../domain/entities/modules.entity'
import {
  TaxConfiguration, TenantLanguage, TenantCurrency, TenantApiKey,
  TenantWebhook, ExchangeRate, Translation, SystemAuditLog, SystemParameter,
} from '../domain/entities/config.entity'

type TenantRow = { id: string; name: string; legalName: string | null; taxId: string | null; taxRegime: string | null; legalAddress: string | null; city: string | null; postalCode: string | null; industryType: string; status: string | null; timezone: string | null; currencyCode: string | null; ownerUserId: string; createdAt: Date; updatedAt: Date }
type BranchRow = { id: string; tenantId: string; name: string; code: string | null; address: string | null; city: string | null; country: string | null; isActive: boolean | null; isHeadquarters: boolean | null; createdAt: Date; updatedAt: Date }
type BrandingRow = { tenantId: string; logoUrl: string | null; faviconUrl: string | null; primaryColor: string | null; secondaryColor: string | null; customDomain: string | null; updatedAt: Date }
type SysModuleRow = { id: string; name: string; slug: string; description: string | null; iconSvg: string | null; category: string | null; isCore: boolean | null; isActive: boolean | null; version: string | null; createdAt: Date; updatedAt: Date }
type InstalledModuleRow = { id: string; tenantId: string; moduleId: string; status: string | null; installedAt: Date; configurationJson: Record<string, unknown> | null }

export class TenantsMapper {
  static tenantToDomain(row: TenantRow): Tenant {
    return new Tenant(row.id, row.name, row.legalName, row.taxId, row.taxRegime,
      row.legalAddress, row.city, row.postalCode, row.industryType,
      (row.status ?? 'ACTIVE') as any, row.timezone ?? 'UTC', row.currencyCode ?? 'USD',
      row.ownerUserId, row.createdAt, row.updatedAt)
  }
  static tenantToPersistence(t: Tenant): TenantRow {
    return { id: t.id, name: t.name, legalName: t.legalName, taxId: t.taxId, taxRegime: t.taxRegime,
      legalAddress: t.legalAddress, city: t.city, postalCode: t.postalCode, industryType: t.industryType,
      status: t.status, timezone: t.timezone, currencyCode: t.currencyCode, ownerUserId: t.ownerUserId,
      createdAt: t.createdAt, updatedAt: t.updatedAt }
  }
  static tenantToResponse(t: Tenant) {
    return { id: t.id, name: t.name, legalName: t.legalName, taxId: t.taxId, taxRegime: t.taxRegime,
      legalAddress: t.legalAddress, city: t.city, postalCode: t.postalCode, industryType: t.industryType,
      status: t.status, timezone: t.timezone, currencyCode: t.currencyCode, ownerUserId: t.ownerUserId,
      createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString() }
  }

  static branchToDomain(row: BranchRow): Branch {
    return new Branch(row.id, row.tenantId, row.name, row.code, row.address,
      row.city, row.country, row.isActive ?? true, row.isHeadquarters ?? false,
      row.createdAt, row.updatedAt)
  }
  static branchToPersistence(b: Branch): BranchRow {
    return { id: b.id, tenantId: b.tenantId, name: b.name, code: b.code, address: b.address,
      city: b.city, country: b.country, isActive: b.isActive, isHeadquarters: b.isHeadquarters,
      createdAt: b.createdAt, updatedAt: b.updatedAt }
  }
  static branchToResponse(b: Branch) {
    return { id: b.id, tenantId: b.tenantId, name: b.name, code: b.code, address: b.address,
      city: b.city, country: b.country, isActive: b.isActive, isHeadquarters: b.isHeadquarters,
      createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString() }
  }

  static brandingToDomain(row: BrandingRow): TenantBranding {
    return new TenantBranding(row.tenantId, row.logoUrl, row.faviconUrl,
      row.primaryColor ?? '#3B82F6', row.secondaryColor ?? '#1E293B',
      row.customDomain, row.updatedAt)
  }
  static brandingToResponse(b: TenantBranding) {
    return { tenantId: b.tenantId, logoUrl: b.logoUrl, faviconUrl: b.faviconUrl,
      primaryColor: b.primaryColor, secondaryColor: b.secondaryColor,
      customDomain: b.customDomain, updatedAt: b.updatedAt.toISOString() }
  }

  static featureToResponse(f: TenantFeature) {
    return { tenantId: f.tenantId, featureCode: f.featureCode, isEnabled: f.isEnabled, enabledAt: f.enabledAt.toISOString() }
  }

  static domainToResponse(d: TenantDomain) {
    return { id: d.id, tenantId: d.tenantId, domain: d.domain, sslStatus: d.sslStatus, isPrimary: d.isPrimary, createdAt: d.createdAt.toISOString() }
  }

  static metricToResponse(m: UsageMetric) {
    return { id: m.id, tenantId: m.tenantId, metricName: m.metricName, currentValue: m.currentValue,
      limitValue: m.limitValue, periodStart: m.periodStart.toISOString(), periodEnd: m.periodEnd.toISOString(), updatedAt: m.updatedAt.toISOString() }
  }

  static sysModuleToResponse(m: SystemModule) {
    return { id: m.id, name: m.name, slug: m.slug, description: m.description, iconSvg: m.iconSvg,
      category: m.category, isCore: m.isCore, isActive: m.isActive, version: m.version,
      createdAt: m.createdAt.toISOString(), updatedAt: m.updatedAt.toISOString() }
  }

  static installedModuleToResponse(m: InstalledModule) {
    return { id: m.id, tenantId: m.tenantId, moduleId: m.moduleId, status: m.status,
      installedAt: m.installedAt.toISOString(), configuration: m.configurationJson }
  }

  static sysModuleToDomain(row: SysModuleRow): SystemModule {
    return new SystemModule(row.id, row.name, row.slug, row.description, row.iconSvg,
      row.category, row.isCore ?? false, row.isActive ?? true, row.version ?? '1.0.0',
      row.createdAt, row.updatedAt)
  }
  static installedModuleToDomain(row: InstalledModuleRow): InstalledModule {
    return new InstalledModule(row.id, row.tenantId, row.moduleId, row.status ?? 'ACTIVE',
      row.installedAt, row.configurationJson)
  }

  // ── Config entities ──

  static taxConfigToDomain(r: any): TaxConfiguration {
    return new TaxConfiguration(r.id, r.tenantId, r.taxName, Number(r.taxPercentage),
      r.description, r.taxType ?? 'SALES', r.isActive ?? true, r.createdAt, r.updatedAt)
  }
  static taxConfigToResponse(c: TaxConfiguration) {
    return { id: c.id, tenantId: c.tenantId, taxName: c.taxName, taxPercentage: c.taxPercentage,
      description: c.description, taxType: c.taxType, isActive: c.isActive,
      createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString() }
  }

  static languageToDomain(r: any): TenantLanguage {
    return new TenantLanguage(r.id, r.tenantId, r.isoCode, r.name,
      r.isDefault ?? false, r.isActive ?? true, r.createdAt, r.updatedAt)
  }
  static languageToResponse(l: TenantLanguage) {
    return { id: l.id, tenantId: l.tenantId, isoCode: l.isoCode, name: l.name,
      isDefault: l.isDefault, isActive: l.isActive,
      createdAt: l.createdAt.toISOString(), updatedAt: l.updatedAt.toISOString() }
  }

  static currencyToDomain(r: any): TenantCurrency {
    return new TenantCurrency(r.id, r.tenantId, r.isoCode, r.name, r.symbol,
      r.isBaseCurrency ?? false, r.isActive ?? true, r.createdAt, r.updatedAt)
  }
  static currencyToResponse(c: TenantCurrency) {
    return { id: c.id, tenantId: c.tenantId, isoCode: c.isoCode, name: c.name, symbol: c.symbol,
      isBaseCurrency: c.isBaseCurrency, isActive: c.isActive,
      createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString() }
  }

  static apiKeyToDomain(r: any): TenantApiKey {
    return new TenantApiKey(r.id, r.tenantId, r.name, r.tokenHash, r.lastFourChars,
      r.scopesJson ?? [], r.expiresAt, r.lastUsedAt, r.isActive ?? true,
      r.createdAt, r.updatedAt)
  }
  static apiKeyToResponse(k: TenantApiKey) {
    return { id: k.id, tenantId: k.tenantId, name: k.name, lastFourChars: k.lastFourChars,
      scopes: k.scopesJson, expiresAt: k.expiresAt?.toISOString() ?? null,
      lastUsedAt: k.lastUsedAt?.toISOString() ?? null, isActive: k.isActive,
      createdAt: k.createdAt.toISOString(), updatedAt: k.updatedAt.toISOString() }
  }

  static webhookToDomain(r: any): TenantWebhook {
    return new TenantWebhook(r.id, r.tenantId, r.name, r.endpointUrl,
      r.secretKey, r.isActive ?? true, r.maxRetries ?? 3, [], r.createdAt, r.updatedAt)
  }
  static webhookToResponse(w: TenantWebhook) {
    return { id: w.id, tenantId: w.tenantId, name: w.name, endpointUrl: w.endpointUrl,
      isActive: w.isActive, maxRetries: w.maxRetries,
      createdAt: w.createdAt.toISOString(), updatedAt: w.updatedAt.toISOString() }
  }

  static exchangeRateToDomain(r: any): ExchangeRate {
    return new ExchangeRate(r.id, r.tenantId, r.fromCurrencyId, r.toCurrencyId,
      Number(r.rate), r.effectiveDate, r.createdAt)
  }
  static exchangeRateToResponse(r: ExchangeRate) {
    return { id: r.id, tenantId: r.tenantId, fromCurrencyId: r.fromCurrencyId,
      toCurrencyId: r.toCurrencyId, rate: r.rate,
      effectiveDate: r.effectiveDate.toISOString(), createdAt: r.createdAt.toISOString() }
  }

  static translationToDomain(r: any): Translation {
    return new Translation(r.id, r.tenantId, r.languageId, r.translationKey, r.translationValue, r.createdAt)
  }
  static translationToResponse(t: Translation) {
    return { id: t.id, tenantId: t.tenantId, languageId: t.languageId,
      translationKey: t.translationKey, translationValue: t.translationValue,
      createdAt: t.createdAt.toISOString() }
  }

  static auditLogToDomain(r: any): SystemAuditLog {
    return new SystemAuditLog(r.id, r.tenantId, r.userId, r.moduleName, r.actionType,
      r.entityName, r.entityId, r.oldValuesJson, r.newValuesJson,
      r.ipAddress, r.userAgent, r.createdAt)
  }
  static auditLogToResponse(l: SystemAuditLog) {
    return { id: l.id, tenantId: l.tenantId, userId: l.userId, moduleName: l.moduleName,
      actionType: l.actionType, entityName: l.entityName, entityId: l.entityId,
      oldValues: l.oldValues, newValues: l.newValues,
      ipAddress: l.ipAddress, userAgent: l.userAgent, createdAt: l.createdAt.toISOString() }
  }

  static sysParamToDomain(r: any): SystemParameter {
    return new SystemParameter(r.paramKey, r.paramValue, r.description,
      r.dataType ?? 'STRING', r.isPublic ?? false, r.createdAt, r.updatedAt)
  }
  static sysParamToResponse(p: SystemParameter) {
    return { paramKey: p.paramKey, paramValue: p.paramValue, description: p.description,
      dataType: p.dataType, isPublic: p.isPublic,
      createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() }
  }
}
