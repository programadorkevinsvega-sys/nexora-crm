/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common'
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
import { TenantsCoreDrizzleHelper } from './tenants-core.drizzle'
import { TenantsFeaturesDrizzleHelper } from './tenants-features.drizzle'
import { TenantsTaxLangCurrDrizzleHelper } from './tenants-tax-lang-curr.drizzle'
import { TenantsKeysWebhooksRatesDrizzleHelper } from './tenants-keys-webhooks-rates.drizzle'
import { TenantsAuditParamsDrizzleHelper } from './tenants-audit-params.drizzle'

@Injectable()
export class DrizzleTenantsRepository extends TenantsRepository {
  // ── Tenants ──
  findTenantById(id: string): Promise<Tenant | null> { return TenantsCoreDrizzleHelper.findTenantById(id) }
  listTenants(search?: string, status?: string, cursor?: string, limit = 20): Promise<PaginatedTenants> {
    return TenantsCoreDrizzleHelper.listTenants(search, status, cursor, limit)
  }
  saveTenant(tenant: Tenant): Promise<void> { return TenantsCoreDrizzleHelper.saveTenant(tenant) }
  deleteTenant(id: string): Promise<void> { return TenantsCoreDrizzleHelper.deleteTenant(id) }

  // ── Branches ──
  findBranchById(id: string): Promise<Branch | null> { return TenantsCoreDrizzleHelper.findBranchById(id) }
  listBranches(tenantId: string): Promise<Branch[]> { return TenantsCoreDrizzleHelper.listBranches(tenantId) }
  saveBranch(branch: Branch): Promise<void> { return TenantsCoreDrizzleHelper.saveBranch(branch) }
  deleteBranch(tenantId: string, id: string): Promise<void> { return TenantsCoreDrizzleHelper.deleteBranch(tenantId, id) }

  // ── Branding ──
  findBranding(tenantId: string): Promise<TenantBranding | null> { return TenantsFeaturesDrizzleHelper.findBranding(tenantId) }
  saveBranding(branding: TenantBranding): Promise<void> { return TenantsFeaturesDrizzleHelper.saveBranding(branding) }

  // ── Features ──
  listFeatures(tenantId: string): Promise<TenantFeature[]> { return TenantsFeaturesDrizzleHelper.listFeatures(tenantId) }
  toggleFeature(tenantId: string, featureCode: string, isEnabled: boolean): Promise<void> {
    return TenantsFeaturesDrizzleHelper.toggleFeature(tenantId, featureCode, isEnabled)
  }

  // ── Domains ──
  findDomainById(id: string): Promise<TenantDomain | null> { return TenantsFeaturesDrizzleHelper.findDomainById(id) }
  listDomains(tenantId: string): Promise<TenantDomain[]> { return TenantsFeaturesDrizzleHelper.listDomains(tenantId) }
  saveDomain(domain: TenantDomain): Promise<void> { return TenantsFeaturesDrizzleHelper.saveDomain(domain) }
  deleteDomain(tenantId: string, id: string): Promise<void> { return TenantsFeaturesDrizzleHelper.deleteDomain(tenantId, id) }
  setPrimaryDomain(tenantId: string, domainId: string): Promise<void> {
    return TenantsFeaturesDrizzleHelper.setPrimaryDomain(tenantId, domainId)
  }

  // ── Usage metrics ──
  listMetrics(tenantId: string): Promise<UsageMetric[]> { return TenantsFeaturesDrizzleHelper.listMetrics(tenantId) }
  upsertMetric(metric: UsageMetric): Promise<void> { return TenantsFeaturesDrizzleHelper.upsertMetric(metric) }

  // ── System modules ──
  listSystemModules(category?: string): Promise<SystemModule[]> { return TenantsFeaturesDrizzleHelper.listSystemModules(category) }
  findSystemModuleById(id: string): Promise<SystemModule | null> { return TenantsFeaturesDrizzleHelper.findSystemModuleById(id) }
  saveSystemModule(module: SystemModule): Promise<void> { return TenantsFeaturesDrizzleHelper.saveSystemModule(module) }

  // ── Installed modules ──
  listInstalledModules(tenantId: string): Promise<InstalledModule[]> { return TenantsFeaturesDrizzleHelper.listInstalledModules(tenantId) }
  findInstalledModule(tenantId: string, moduleId: string): Promise<InstalledModule | null> {
    return TenantsFeaturesDrizzleHelper.findInstalledModule(tenantId, moduleId)
  }
  installModule(module: InstalledModule): Promise<void> { return TenantsFeaturesDrizzleHelper.installModule(module) }
  uninstallModule(tenantId: string, moduleId: string): Promise<void> { return TenantsFeaturesDrizzleHelper.uninstallModule(tenantId, moduleId) }

  // ── Tax configurations ──
  listTaxConfigs(tenantId: string): Promise<TaxConfiguration[]> { return TenantsTaxLangCurrDrizzleHelper.listTaxConfigs(tenantId) }
  findTaxConfigById(id: string): Promise<TaxConfiguration | null> { return TenantsTaxLangCurrDrizzleHelper.findTaxConfigById(id) }
  saveTaxConfig(config: TaxConfiguration): Promise<void> { return TenantsTaxLangCurrDrizzleHelper.saveTaxConfig(config) }
  deleteTaxConfig(tenantId: string, id: string): Promise<void> { return TenantsTaxLangCurrDrizzleHelper.deleteTaxConfig(tenantId, id) }

  // ── Languages ──
  listLanguages(tenantId: string): Promise<TenantLanguage[]> { return TenantsTaxLangCurrDrizzleHelper.listLanguages(tenantId) }
  findLanguageById(id: string): Promise<TenantLanguage | null> { return TenantsTaxLangCurrDrizzleHelper.findLanguageById(id) }
  saveLanguage(lang: TenantLanguage): Promise<void> { return TenantsTaxLangCurrDrizzleHelper.saveLanguage(lang) }
  deleteLanguage(tenantId: string, id: string): Promise<void> { return TenantsTaxLangCurrDrizzleHelper.deleteLanguage(tenantId, id) }
  setDefaultLanguage(tenantId: string, languageId: string): Promise<void> {
    return TenantsTaxLangCurrDrizzleHelper.setDefaultLanguage(tenantId, languageId)
  }

  // ── Currencies ──
  listCurrencies(tenantId: string): Promise<TenantCurrency[]> { return TenantsTaxLangCurrDrizzleHelper.listCurrencies(tenantId) }
  findCurrencyById(id: string): Promise<TenantCurrency | null> { return TenantsTaxLangCurrDrizzleHelper.findCurrencyById(id) }
  saveCurrency(curr: TenantCurrency): Promise<void> { return TenantsTaxLangCurrDrizzleHelper.saveCurrency(curr) }
  deleteCurrency(tenantId: string, id: string): Promise<void> { return TenantsTaxLangCurrDrizzleHelper.deleteCurrency(tenantId, id) }
  setBaseCurrency(tenantId: string, currencyId: string): Promise<void> {
    return TenantsTaxLangCurrDrizzleHelper.setBaseCurrency(tenantId, currencyId)
  }

  // ── API Keys ──
  listApiKeys(tenantId: string): Promise<TenantApiKey[]> { return TenantsKeysWebhooksRatesDrizzleHelper.listApiKeys(tenantId) }
  findApiKeyById(id: string): Promise<TenantApiKey | null> { return TenantsKeysWebhooksRatesDrizzleHelper.findApiKeyById(id) }
  saveApiKey(key: TenantApiKey): Promise<void> { return TenantsKeysWebhooksRatesDrizzleHelper.saveApiKey(key) }
  revokeApiKey(tenantId: string, id: string): Promise<void> { return TenantsKeysWebhooksRatesDrizzleHelper.revokeApiKey(tenantId, id) }

  // ── Webhooks ──
  listWebhooks(tenantId: string): Promise<TenantWebhook[]> { return TenantsKeysWebhooksRatesDrizzleHelper.listWebhooks(tenantId) }
  findWebhookById(id: string): Promise<TenantWebhook | null> { return TenantsKeysWebhooksRatesDrizzleHelper.findWebhookById(id) }
  saveWebhook(webhook: TenantWebhook): Promise<void> { return TenantsKeysWebhooksRatesDrizzleHelper.saveWebhook(webhook) }
  deleteWebhook(tenantId: string, id: string): Promise<void> { return TenantsKeysWebhooksRatesDrizzleHelper.deleteWebhook(tenantId, id) }

  // ── Exchange rates ──
  listExchangeRates(tenantId: string): Promise<ExchangeRate[]> { return TenantsKeysWebhooksRatesDrizzleHelper.listExchangeRates(tenantId) }
  saveExchangeRate(rate: ExchangeRate): Promise<void> { return TenantsKeysWebhooksRatesDrizzleHelper.saveExchangeRate(rate) }

  // ── Translations ──
  listTranslations(tenantId: string, languageId?: string): Promise<Translation[]> {
    return TenantsKeysWebhooksRatesDrizzleHelper.listTranslations(tenantId, languageId)
  }
  findTranslationById(id: string): Promise<Translation | null> { return TenantsKeysWebhooksRatesDrizzleHelper.findTranslationById(id) }
  saveTranslation(t: Translation): Promise<void> { return TenantsKeysWebhooksRatesDrizzleHelper.saveTranslation(t) }
  deleteTranslation(tenantId: string, id: string): Promise<void> { return TenantsKeysWebhooksRatesDrizzleHelper.deleteTranslation(tenantId, id) }

  // ── Audit logs ──
  listAuditLogs(tenantId: string, moduleName?: string, cursor?: string, limit = 20): Promise<{ data: SystemAuditLog[]; nextCursor: string | null }> {
    return TenantsAuditParamsDrizzleHelper.listAuditLogs(tenantId, moduleName, cursor, limit)
  }

  // ── System parameters ──
  getParameter(paramKey: string): Promise<SystemParameter | null> {
    return TenantsAuditParamsDrizzleHelper.getParameter(paramKey)
  }
  setParameter(param: SystemParameter): Promise<void> {
    return TenantsAuditParamsDrizzleHelper.setParameter(param)
  }
}
