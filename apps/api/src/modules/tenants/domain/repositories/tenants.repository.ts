import { Tenant } from '../entities/tenant.entity'
import { Branch } from '../entities/branch.entity'
import { TenantBranding } from '../entities/branding.entity'
import { TenantFeature, TenantDomain, UsageMetric } from '../entities/features.entity'
import { SystemModule, InstalledModule } from '../entities/modules.entity'
import {
  TaxConfiguration, TenantLanguage, TenantCurrency, TenantApiKey,
  TenantWebhook, ExchangeRate, Translation, SystemAuditLog, SystemParameter,
} from '../entities/config.entity'

export interface PaginatedTenants {
  data: Tenant[]
  nextCursor: string | null
}

export abstract class TenantsRepository {
  // Tenants
  abstract findTenantById(id: string): Promise<Tenant | null>
  abstract listTenants(search?: string, status?: string, cursor?: string, limit?: number): Promise<PaginatedTenants>
  abstract saveTenant(tenant: Tenant): Promise<void>
  abstract deleteTenant(id: string): Promise<void>

  // Branches
  abstract findBranchById(id: string): Promise<Branch | null>
  abstract listBranches(tenantId: string): Promise<Branch[]>
  abstract saveBranch(branch: Branch): Promise<void>
  abstract deleteBranch(tenantId: string, id: string): Promise<void>

  // Branding
  abstract findBranding(tenantId: string): Promise<TenantBranding | null>
  abstract saveBranding(branding: TenantBranding): Promise<void>

  // Features
  abstract listFeatures(tenantId: string): Promise<TenantFeature[]>
  abstract toggleFeature(tenantId: string, featureCode: string, isEnabled: boolean): Promise<void>

  // Domains
  abstract findDomainById(id: string): Promise<TenantDomain | null>
  abstract listDomains(tenantId: string): Promise<TenantDomain[]>
  abstract saveDomain(domain: TenantDomain): Promise<void>
  abstract deleteDomain(tenantId: string, id: string): Promise<void>
  abstract setPrimaryDomain(tenantId: string, domainId: string): Promise<void>

  // Usage metrics
  abstract listMetrics(tenantId: string): Promise<UsageMetric[]>
  abstract upsertMetric(metric: UsageMetric): Promise<void>

  // Modules
  abstract listSystemModules(category?: string): Promise<SystemModule[]>
  abstract findSystemModuleById(id: string): Promise<SystemModule | null>
  abstract listInstalledModules(tenantId: string): Promise<InstalledModule[]>
  abstract findInstalledModule(tenantId: string, moduleId: string): Promise<InstalledModule | null>
  abstract installModule(installed: InstalledModule): Promise<void>
  abstract uninstallModule(tenantId: string, moduleId: string): Promise<void>
  abstract saveSystemModule(module: SystemModule): Promise<void>

  // Tax configurations
  abstract listTaxConfigs(tenantId: string): Promise<TaxConfiguration[]>
  abstract findTaxConfigById(id: string): Promise<TaxConfiguration | null>
  abstract saveTaxConfig(config: TaxConfiguration): Promise<void>
  abstract deleteTaxConfig(tenantId: string, id: string): Promise<void>

  // Languages
  abstract listLanguages(tenantId: string): Promise<TenantLanguage[]>
  abstract findLanguageById(id: string): Promise<TenantLanguage | null>
  abstract saveLanguage(lang: TenantLanguage): Promise<void>
  abstract deleteLanguage(tenantId: string, id: string): Promise<void>
  abstract setDefaultLanguage(tenantId: string, languageId: string): Promise<void>

  // Currencies
  abstract listCurrencies(tenantId: string): Promise<TenantCurrency[]>
  abstract findCurrencyById(id: string): Promise<TenantCurrency | null>
  abstract saveCurrency(curr: TenantCurrency): Promise<void>
  abstract deleteCurrency(tenantId: string, id: string): Promise<void>
  abstract setBaseCurrency(tenantId: string, currencyId: string): Promise<void>

  // API Keys
  abstract listApiKeys(tenantId: string): Promise<TenantApiKey[]>
  abstract findApiKeyById(id: string): Promise<TenantApiKey | null>
  abstract saveApiKey(key: TenantApiKey): Promise<void>
  abstract revokeApiKey(tenantId: string, id: string): Promise<void>

  // Webhooks
  abstract listWebhooks(tenantId: string): Promise<TenantWebhook[]>
  abstract findWebhookById(id: string): Promise<TenantWebhook | null>
  abstract saveWebhook(webhook: TenantWebhook): Promise<void>
  abstract deleteWebhook(tenantId: string, id: string): Promise<void>

  // Exchange rates
  abstract listExchangeRates(tenantId: string): Promise<ExchangeRate[]>
  abstract saveExchangeRate(rate: ExchangeRate): Promise<void>

  // Translations
  abstract listTranslations(tenantId: string, languageId?: string): Promise<Translation[]>
  abstract findTranslationById(id: string): Promise<Translation | null>
  abstract saveTranslation(t: Translation): Promise<void>
  abstract deleteTranslation(tenantId: string, id: string): Promise<void>

  // Audit logs
  abstract listAuditLogs(tenantId: string, moduleName?: string, cursor?: string, limit?: number): Promise<{ data: SystemAuditLog[]; nextCursor: string | null }>

  // System parameters
  abstract getParameter(paramKey: string): Promise<SystemParameter | null>
  abstract setParameter(param: SystemParameter): Promise<void>
}
