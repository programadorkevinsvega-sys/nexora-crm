/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateTenantHandler, UpdateTenantHandler, DeleteTenantHandler,
  CreateBranchHandler, UpdateBranchHandler, DeleteBranchHandler,
  UpdateBrandingHandler, ToggleFeatureHandler,
  CreateDomainHandler, DeleteDomainHandler, SetPrimaryDomainHandler,
  UpsertMetricHandler, InstallModuleHandler, UninstallModuleHandler,
} from '../../application/commands/tenants.handlers'
import {
  GetTenantHandler, GetBranchHandler,
  ListTenantsHandler, GetBrandingHandler, ListBranchesHandler,
  ListFeaturesHandler, ListDomainsHandler, ListMetricsHandler,
  ListSystemModulesHandler, ListInstalledModulesHandler,
} from '../../application/queries/tenants.handlers'
import {
  CreateTenantCommand, UpdateTenantCommand, DeleteTenantCommand,
  CreateBranchCommand, UpdateBranchCommand, DeleteBranchCommand,
  UpdateBrandingCommand, ToggleFeatureCommand,
  CreateDomainCommand, DeleteDomainCommand, SetPrimaryDomainCommand,
  UpsertMetricCommand, InstallModuleCommand, UninstallModuleCommand,
} from '../../application/commands/tenants.commands'
import {
  ListTenantsQuery, GetBrandingQuery, ListBranchesQuery,
  ListFeaturesQuery, ListDomainsQuery, ListMetricsQuery,
  ListSystemModulesQuery, ListInstalledModulesQuery,
} from '../../application/queries/tenants.queries'
import { TenantsMapper } from '../../infrastructure/tenants.mapper'
import {
  CreateTaxConfigHandler, UpdateTaxConfigHandler, DeleteTaxConfigHandler, ListTaxConfigsHandler,
  CreateLanguageHandler, UpdateLanguageHandler, DeleteLanguageHandler, ListLanguagesHandler, SetDefaultLanguageHandler,
  CreateCurrencyHandler, UpdateCurrencyHandler, DeleteCurrencyHandler, ListCurrenciesHandler, SetBaseCurrencyHandler,
  CreateApiKeyHandler, RevokeApiKeyHandler, ListApiKeysHandler,
  CreateWebhookHandler, UpdateWebhookHandler, DeleteWebhookHandler, ListWebhooksHandler, GetWebhookHandler,
  CreateExchangeRateHandler, ListExchangeRatesHandler,
  CreateTranslationHandler, UpdateTranslationHandler, DeleteTranslationHandler, ListTranslationsHandler,
  ListAuditLogsHandler,
  GetParameterHandler, SetParameterHandler,
} from '../../application/config.handlers'
import {
  CreateTaxConfigCommand, UpdateTaxConfigCommand, DeleteTaxConfigCommand, ListTaxConfigsQuery,
  CreateLanguageCommand, UpdateLanguageCommand, DeleteLanguageCommand, ListLanguagesQuery, SetDefaultLanguageCommand,
  CreateCurrencyCommand, UpdateCurrencyCommand, DeleteCurrencyCommand, ListCurrenciesQuery, SetBaseCurrencyCommand,
  CreateApiKeyCommand, RevokeApiKeyCommand, ListApiKeysQuery,
  CreateWebhookCommand, UpdateWebhookCommand, DeleteWebhookCommand, ListWebhooksQuery, GetWebhookQuery,
  CreateExchangeRateCommand, ListExchangeRatesQuery,
  CreateTranslationCommand, UpdateTranslationCommand, DeleteTranslationCommand, ListTranslationsQuery,
  ListAuditLogsQuery,
  GetParameterQuery, SetParameterCommand,
} from '../../application/config.handlers'

@Controller()
export class TenantsGrpcController {
  constructor(
    private readonly getTenantHandler: GetTenantHandler,
    private readonly createTenantHandler: CreateTenantHandler,
    private readonly updateTenantHandler: UpdateTenantHandler,
    private readonly deleteTenantHandler: DeleteTenantHandler,
    private readonly listTenantsHandler: ListTenantsHandler,
    private readonly getBranchHandler: GetBranchHandler,
    private readonly createBranchHandler: CreateBranchHandler,
    private readonly updateBranchHandler: UpdateBranchHandler,
    private readonly deleteBranchHandler: DeleteBranchHandler,
    private readonly listBranchesHandler: ListBranchesHandler,
    private readonly getBrandingHandler: GetBrandingHandler,
    private readonly updateBrandingHandler: UpdateBrandingHandler,
    private readonly listFeaturesHandler: ListFeaturesHandler,
    private readonly toggleFeatureHandler: ToggleFeatureHandler,
    private readonly createDomainHandler: CreateDomainHandler,
    private readonly listDomainsHandler: ListDomainsHandler,
    private readonly deleteDomainHandler: DeleteDomainHandler,
    private readonly setPrimaryDomainHandler: SetPrimaryDomainHandler,
    private readonly listMetricsHandler: ListMetricsHandler,
    private readonly upsertMetricHandler: UpsertMetricHandler,
    private readonly listSystemModulesHandler: ListSystemModulesHandler,
    private readonly listInstalledModulesHandler: ListInstalledModulesHandler,
    private readonly installModuleHandler: InstallModuleHandler,
    private readonly uninstallModuleHandler: UninstallModuleHandler,
    private readonly createTaxConfigHandler: CreateTaxConfigHandler,
    private readonly updateTaxConfigHandler: UpdateTaxConfigHandler,
    private readonly deleteTaxConfigHandler: DeleteTaxConfigHandler,
    private readonly listTaxConfigsHandler: ListTaxConfigsHandler,
    private readonly createLanguageHandler: CreateLanguageHandler,
    private readonly updateLanguageHandler: UpdateLanguageHandler,
    private readonly deleteLanguageHandler: DeleteLanguageHandler,
    private readonly listLanguagesHandler: ListLanguagesHandler,
    private readonly setDefaultLanguageHandler: SetDefaultLanguageHandler,
    private readonly createCurrencyHandler: CreateCurrencyHandler,
    private readonly updateCurrencyHandler: UpdateCurrencyHandler,
    private readonly deleteCurrencyHandler: DeleteCurrencyHandler,
    private readonly listCurrenciesHandler: ListCurrenciesHandler,
    private readonly setBaseCurrencyHandler: SetBaseCurrencyHandler,
    private readonly createApiKeyHandler: CreateApiKeyHandler,
    private readonly revokeApiKeyHandler: RevokeApiKeyHandler,
    private readonly listApiKeysHandler: ListApiKeysHandler,
    private readonly createWebhookHandler: CreateWebhookHandler,
    private readonly updateWebhookHandler: UpdateWebhookHandler,
    private readonly deleteWebhookHandler: DeleteWebhookHandler,
    private readonly listWebhooksHandler: ListWebhooksHandler,
    private readonly getWebhookHandler: GetWebhookHandler,
    private readonly createExchangeRateHandler: CreateExchangeRateHandler,
    private readonly listExchangeRatesHandler: ListExchangeRatesHandler,
    private readonly createTranslationHandler: CreateTranslationHandler,
    private readonly updateTranslationHandler: UpdateTranslationHandler,
    private readonly deleteTranslationHandler: DeleteTranslationHandler,
    private readonly listTranslationsHandler: ListTranslationsHandler,
    private readonly listAuditLogsHandler: ListAuditLogsHandler,
    private readonly getParameterHandler: GetParameterHandler,
    private readonly setParameterHandler: SetParameterHandler,
  ) {}

  @GrpcMethod('TenantService', 'CreateTenant')
  async createTenant(data: any) {
    const result = await this.createTenantHandler.execute(
      new CreateTenantCommand(data.ownerUserId, data.industryType, data.name,
        data.legalName, data.taxId, data.taxRegime, data.legalAddress,
        data.city, data.postalCode, data.timezone, data.currencyCode),
    )
    return { json: JSON.stringify(TenantsMapper.tenantToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'GetTenant')
  async getTenant(data: { id: string }) {
    const result = await this.getTenantHandler.execute(data.id)
    return { json: JSON.stringify(TenantsMapper.tenantToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'ListTenants')
  async listTenants(data: any) {
    const result = await this.listTenantsHandler.execute(
      new ListTenantsQuery(data.search, data.status, data.cursor, data.limit ?? 20),
    )
    return {
      jsonItems: result.data.map(t => JSON.stringify(TenantsMapper.tenantToResponse(t))),
      nextCursor: result.nextCursor ?? '',
    }
  }

  @GrpcMethod('TenantService', 'UpdateTenant')
  async updateTenant(data: any) {
    const result = await this.updateTenantHandler.execute(
      new UpdateTenantCommand(data.id, data.name, data.legalName, data.taxId, data.taxRegime,
        data.legalAddress, data.city, data.postalCode, data.industryType,
        data.status, data.timezone, data.currencyCode),
    )
    return { json: JSON.stringify(TenantsMapper.tenantToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'DeleteTenant')
  async deleteTenant(data: { id: string }) {
    await this.deleteTenantHandler.execute(new DeleteTenantCommand(data.id))
    return {}
  }

  @GrpcMethod('TenantService', 'CreateBranch')
  async createBranch(data: any) {
    const result = await this.createBranchHandler.execute(
      new CreateBranchCommand(data.tenantId, data.name, data.code, data.address, data.city, data.country, data.isHeadquarters),
    )
    return { json: JSON.stringify(TenantsMapper.branchToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'GetBranch')
  async getBranch(data: { id: string }) {
    const result = await this.getBranchHandler.execute(data.id)
    return { json: JSON.stringify(TenantsMapper.branchToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'ListBranches')
  async listBranches(data: { tenantId: string }) {
    const result = await this.listBranchesHandler.execute(new ListBranchesQuery(data.tenantId))
    return { jsonItems: result.map(b => JSON.stringify(TenantsMapper.branchToResponse(b))) }
  }

  @GrpcMethod('TenantService', 'UpdateBranch')
  async updateBranch(data: any) {
    const result = await this.updateBranchHandler.execute(
      new UpdateBranchCommand(data.tenantId, data.id, data.name, data.code, data.address, data.city, data.country, data.isActive, data.isHeadquarters),
    )
    return { json: JSON.stringify(TenantsMapper.branchToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'DeleteBranch')
  async deleteBranch(data: { tenantId: string; id: string }) {
    await this.deleteBranchHandler.execute(new DeleteBranchCommand(data.tenantId, data.id))
    return {}
  }

  @GrpcMethod('TenantService', 'GetBranding')
  async getBranding(data: { id: string }) {
    const result = await this.getBrandingHandler.execute(new GetBrandingQuery(data.id))
    return { json: JSON.stringify(TenantsMapper.brandingToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'UpdateBranding')
  async updateBranding(data: any) {
    await this.updateBrandingHandler.execute(
      new UpdateBrandingCommand(data.tenantId, data.logoUrl, data.faviconUrl, data.primaryColor, data.secondaryColor, data.customDomain),
    )
    return {}
  }

  @GrpcMethod('TenantService', 'ListFeatures')
  async listFeatures(data: { tenantId: string }) {
    const result = await this.listFeaturesHandler.execute(new ListFeaturesQuery(data.tenantId))
    return { jsonItems: result.map(f => JSON.stringify(TenantsMapper.featureToResponse(f))) }
  }

  @GrpcMethod('TenantService', 'ToggleFeature')
  async toggleFeature(data: { tenantId: string; featureCode: string; isEnabled: boolean }) {
    await this.toggleFeatureHandler.execute(new ToggleFeatureCommand(data.tenantId, data.featureCode, data.isEnabled))
    return {}
  }

  @GrpcMethod('TenantService', 'CreateDomain')
  async createDomain(data: any) {
    await this.createDomainHandler.execute(new CreateDomainCommand(data.tenantId, data.domain, data.isPrimary))
    return {}
  }

  @GrpcMethod('TenantService', 'ListDomains')
  async listDomains(data: { tenantId: string }) {
    const result = await this.listDomainsHandler.execute(new ListDomainsQuery(data.tenantId))
    return { jsonItems: result.map(d => JSON.stringify(TenantsMapper.domainToResponse(d))) }
  }

  @GrpcMethod('TenantService', 'DeleteDomain')
  async deleteDomain(data: { tenantId: string; id: string }) {
    await this.deleteDomainHandler.execute(new DeleteDomainCommand(data.tenantId, data.id))
    return {}
  }

  @GrpcMethod('TenantService', 'SetPrimaryDomain')
  async setPrimaryDomain(data: { tenantId: string; domainId: string }) {
    await this.setPrimaryDomainHandler.execute(new SetPrimaryDomainCommand(data.tenantId, data.domainId))
    return {}
  }

  @GrpcMethod('TenantService', 'ListMetrics')
  async listMetrics(data: { tenantId: string }) {
    const result = await this.listMetricsHandler.execute(new ListMetricsQuery(data.tenantId))
    return { jsonItems: result.map(m => JSON.stringify(TenantsMapper.metricToResponse(m))) }
  }

  @GrpcMethod('TenantService', 'UpsertMetric')
  async upsertMetric(data: any) {
    const result = await this.upsertMetricHandler.execute(
      new UpsertMetricCommand(data.tenantId, data.metricName, data.currentValue, data.limitValue, data.periodStart ?? new Date().toISOString(), data.periodEnd ?? new Date().toISOString()),
    )
    return { json: JSON.stringify(TenantsMapper.metricToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'ListSystemModules')
  async listSystemModules(data: { category?: string }) {
    const result = await this.listSystemModulesHandler.execute(new ListSystemModulesQuery(data.category))
    return { jsonItems: result.map(m => JSON.stringify(TenantsMapper.sysModuleToResponse(m))) }
  }

  @GrpcMethod('TenantService', 'ListInstalledModules')
  async listInstalledModules(data: { tenantId: string }) {
    const result = await this.listInstalledModulesHandler.execute(new ListInstalledModulesQuery(data.tenantId))
    return { jsonItems: result.map(m => JSON.stringify(TenantsMapper.installedModuleToResponse(m))) }
  }

  @GrpcMethod('TenantService', 'InstallModule')
  async installModule(data: { tenantId: string; moduleId: string }) {
    await this.installModuleHandler.execute(new InstallModuleCommand(data.tenantId, data.moduleId))
    return {}
  }

  @GrpcMethod('TenantService', 'UninstallModule')
  async uninstallModule(data: { tenantId: string; moduleId: string }) {
    await this.uninstallModuleHandler.execute(new UninstallModuleCommand(data.tenantId, data.moduleId))
    return {}
  }

  @GrpcMethod('TenantService', 'CreateTaxConfig')
  async createTaxConfig(data: any) {
    const result = await this.createTaxConfigHandler.execute(
      new CreateTaxConfigCommand(data.tenantId, data.taxName, data.taxPercentage, data.description, data.taxType))
    return { json: JSON.stringify(TenantsMapper.taxConfigToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'ListTaxConfigs')
  async listTaxConfigs(data: { tenantId: string }) {
    const result = await this.listTaxConfigsHandler.execute(new ListTaxConfigsQuery(data.tenantId))
    return { jsonItems: result.map(c => JSON.stringify(TenantsMapper.taxConfigToResponse(c))) }
  }

  @GrpcMethod('TenantService', 'UpdateTaxConfig')
  async updateTaxConfig(data: any) {
    const result = await this.updateTaxConfigHandler.execute(
      new UpdateTaxConfigCommand(data.id, data.tenantId, data.taxName, data.taxPercentage, data.description, data.taxType, data.isActive))
    return { json: JSON.stringify(TenantsMapper.taxConfigToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'DeleteTaxConfig')
  async deleteTaxConfig(data: { tenantId: string; id: string }) {
    await this.deleteTaxConfigHandler.execute(new DeleteTaxConfigCommand(data.tenantId, data.id))
    return {}
  }

  @GrpcMethod('TenantService', 'CreateLanguage')
  async createLanguage(data: any) {
    const result = await this.createLanguageHandler.execute(
      new CreateLanguageCommand(data.tenantId, data.isoCode, data.name, data.isDefault))
    return { json: JSON.stringify(TenantsMapper.languageToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'ListLanguages')
  async listLanguages(data: { tenantId: string }) {
    const result = await this.listLanguagesHandler.execute(new ListLanguagesQuery(data.tenantId))
    return { jsonItems: result.map(l => JSON.stringify(TenantsMapper.languageToResponse(l))) }
  }

  @GrpcMethod('TenantService', 'UpdateLanguage')
  async updateLanguage(data: any) {
    const result = await this.updateLanguageHandler.execute(
      new UpdateLanguageCommand(data.id, data.tenantId, data.isoCode, data.name, data.isDefault, data.isActive))
    return { json: JSON.stringify(TenantsMapper.languageToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'DeleteLanguage')
  async deleteLanguage(data: { tenantId: string; id: string }) {
    await this.deleteLanguageHandler.execute(new DeleteLanguageCommand(data.tenantId, data.id))
    return {}
  }

  @GrpcMethod('TenantService', 'SetDefaultLanguage')
  async setDefaultLanguage(data: { tenantId: string; languageId: string }) {
    await this.setDefaultLanguageHandler.execute(new SetDefaultLanguageCommand(data.tenantId, data.languageId))
    return {}
  }

  @GrpcMethod('TenantService', 'CreateCurrency')
  async createCurrency(data: any) {
    const result = await this.createCurrencyHandler.execute(
      new CreateCurrencyCommand(data.tenantId, data.isoCode, data.name, data.symbol, data.isBaseCurrency))
    return { json: JSON.stringify(TenantsMapper.currencyToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'ListCurrencies')
  async listCurrencies(data: { tenantId: string }) {
    const result = await this.listCurrenciesHandler.execute(new ListCurrenciesQuery(data.tenantId))
    return { jsonItems: result.map(c => JSON.stringify(TenantsMapper.currencyToResponse(c))) }
  }

  @GrpcMethod('TenantService', 'UpdateCurrency')
  async updateCurrency(data: any) {
    const result = await this.updateCurrencyHandler.execute(
      new UpdateCurrencyCommand(data.id, data.tenantId, data.isoCode, data.name, data.symbol, data.isBaseCurrency, data.isActive))
    return { json: JSON.stringify(TenantsMapper.currencyToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'DeleteCurrency')
  async deleteCurrency(data: { tenantId: string; id: string }) {
    await this.deleteCurrencyHandler.execute(new DeleteCurrencyCommand(data.tenantId, data.id))
    return {}
  }

  @GrpcMethod('TenantService', 'SetBaseCurrency')
  async setBaseCurrency(data: { tenantId: string; currencyId: string }) {
    await this.setBaseCurrencyHandler.execute(new SetBaseCurrencyCommand(data.tenantId, data.currencyId))
    return {}
  }

  @GrpcMethod('TenantService', 'CreateApiKey')
  async createApiKey(data: any) {
    const { apiKey, rawToken } = await this.createApiKeyHandler.execute(
      new CreateApiKeyCommand(data.tenantId, data.name, data.scopes, data.expiresAt ? new Date(data.expiresAt) : undefined))
    return { json: JSON.stringify(TenantsMapper.apiKeyToResponse(apiKey)), rawToken }
  }

  @GrpcMethod('TenantService', 'ListApiKeys')
  async listApiKeys(data: { tenantId: string }) {
    const result = await this.listApiKeysHandler.execute(new ListApiKeysQuery(data.tenantId))
    return { jsonItems: result.map(k => JSON.stringify(TenantsMapper.apiKeyToResponse(k))) }
  }

  @GrpcMethod('TenantService', 'RevokeApiKey')
  async revokeApiKey(data: { tenantId: string; id: string }) {
    await this.revokeApiKeyHandler.execute(new RevokeApiKeyCommand(data.tenantId, data.id))
    return {}
  }

  @GrpcMethod('TenantService', 'CreateWebhook')
  async createWebhook(data: any) {
    const result = await this.createWebhookHandler.execute(
      new CreateWebhookCommand(data.tenantId, data.name, data.endpointUrl, data.eventTypes))
    return { json: JSON.stringify(TenantsMapper.webhookToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'GetWebhook')
  async getWebhook(data: { id: string }) {
    const result = await this.getWebhookHandler.execute(new GetWebhookQuery(data.id))
    return { json: JSON.stringify(TenantsMapper.webhookToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'ListWebhooks')
  async listWebhooks(data: { tenantId: string }) {
    const result = await this.listWebhooksHandler.execute(new ListWebhooksQuery(data.tenantId))
    return { jsonItems: result.map(w => JSON.stringify(TenantsMapper.webhookToResponse(w))) }
  }

  @GrpcMethod('TenantService', 'UpdateWebhook')
  async updateWebhook(data: any) {
    const result = await this.updateWebhookHandler.execute(
      new UpdateWebhookCommand(data.id, data.tenantId, data.name, data.endpointUrl, data.isActive, data.maxRetries, data.eventTypes))
    return { json: JSON.stringify(TenantsMapper.webhookToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'DeleteWebhook')
  async deleteWebhook(data: { tenantId: string; id: string }) {
    await this.deleteWebhookHandler.execute(new DeleteWebhookCommand(data.tenantId, data.id))
    return {}
  }

  @GrpcMethod('TenantService', 'CreateExchangeRate')
  async createExchangeRate(data: any) {
    const result = await this.createExchangeRateHandler.execute(
      new CreateExchangeRateCommand(data.tenantId, data.fromCurrencyId, data.toCurrencyId, data.rate, data.effectiveDate))
    return { json: JSON.stringify(TenantsMapper.exchangeRateToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'ListExchangeRates')
  async listExchangeRates(data: { tenantId: string }) {
    const result = await this.listExchangeRatesHandler.execute(new ListExchangeRatesQuery(data.tenantId))
    return { jsonItems: result.map(r => JSON.stringify(TenantsMapper.exchangeRateToResponse(r))) }
  }

  @GrpcMethod('TenantService', 'CreateTranslation')
  async createTranslation(data: any) {
    const result = await this.createTranslationHandler.execute(
      new CreateTranslationCommand(data.tenantId, data.languageId, data.translationKey, data.translationValue))
    return { json: JSON.stringify(TenantsMapper.translationToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'ListTranslations')
  async listTranslations(data: { tenantId: string; languageId?: string }) {
    const result = await this.listTranslationsHandler.execute(new ListTranslationsQuery(data.tenantId, data.languageId))
    return { jsonItems: result.map(t => JSON.stringify(TenantsMapper.translationToResponse(t))) }
  }

  @GrpcMethod('TenantService', 'UpdateTranslation')
  async updateTranslation(data: { id: string; tenantId: string; translationValue: string }) {
    const result = await this.updateTranslationHandler.execute(
      new UpdateTranslationCommand(data.id, data.tenantId, data.translationValue))
    return { json: JSON.stringify(TenantsMapper.translationToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'DeleteTranslation')
  async deleteTranslation(data: { tenantId: string; id: string }) {
    await this.deleteTranslationHandler.execute(new DeleteTranslationCommand(data.tenantId, data.id))
    return {}
  }

  @GrpcMethod('TenantService', 'ListAuditLogs')
  async listAuditLogs(data: { tenantId: string; moduleName?: string; cursor?: string; limit?: number }) {
    const result = await this.listAuditLogsHandler.execute(new ListAuditLogsQuery(data.tenantId, data.moduleName, data.cursor, data.limit))
    return { jsonItems: result.data.map(l => JSON.stringify(TenantsMapper.auditLogToResponse(l))), nextCursor: result.nextCursor ?? '' }
  }

  @GrpcMethod('TenantService', 'GetParameter')
  async getParameter(data: { paramKey: string }) {
    const result = await this.getParameterHandler.execute(new GetParameterQuery(data.paramKey))
    if (!result) return {}
    return { json: JSON.stringify(TenantsMapper.sysParamToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'SetParameter')
  async setParameter(data: any) {
    await this.setParameterHandler.execute(
      new SetParameterCommand(data.paramKey, data.paramValue, data.description, data.dataType, data.isPublic))
    return {}
  }
}
