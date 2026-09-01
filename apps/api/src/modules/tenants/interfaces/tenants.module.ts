import { Module } from '@nestjs/common'
import { TenantsCoreGrpcController } from './grpc/tenants-core-grpc.controller'
import { TenantsFeaturesGrpcController } from './grpc/tenants-features-grpc.controller'
import { TenantsTaxLangCurrGrpcController } from './grpc/tenants-tax-lang-curr-grpc.controller'
import { TenantsKeysWebhooksRatesGrpcController } from './grpc/tenants-keys-webhooks-rates-grpc.controller'
import {
  CreateTenantHandler, UpdateTenantHandler, DeleteTenantHandler,
  CreateBranchHandler, UpdateBranchHandler, DeleteBranchHandler,
  UpdateBrandingHandler, ToggleFeatureHandler,
  CreateDomainHandler, DeleteDomainHandler, SetPrimaryDomainHandler,
  UpsertMetricHandler, InstallModuleHandler, UninstallModuleHandler,
} from '../application/commands/tenants.handlers'
import {
  GetTenantHandler, GetBranchHandler,
  ListTenantsHandler, GetBrandingHandler, ListBranchesHandler,
  ListFeaturesHandler, ListDomainsHandler, ListMetricsHandler,
  ListSystemModulesHandler, ListInstalledModulesHandler,
} from '../application/queries/tenants.handlers'
import { TenantsRepository } from '../domain/repositories/tenants.repository'
import { DrizzleTenantsRepository } from '../infrastructure/drizzle-tenants.repository'
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
} from '../application/config.handlers'

@Module({
  controllers: [
    TenantsCoreGrpcController,
    TenantsFeaturesGrpcController,
    TenantsTaxLangCurrGrpcController,
    TenantsKeysWebhooksRatesGrpcController,
  ],
  providers: [
    GetTenantHandler, GetBranchHandler,
    CreateTenantHandler, UpdateTenantHandler, DeleteTenantHandler,
    CreateBranchHandler, UpdateBranchHandler, DeleteBranchHandler,
    UpdateBrandingHandler, ToggleFeatureHandler,
    CreateDomainHandler, DeleteDomainHandler, SetPrimaryDomainHandler,
    UpsertMetricHandler, InstallModuleHandler, UninstallModuleHandler,
    ListTenantsHandler, GetBrandingHandler, ListBranchesHandler,
    ListFeaturesHandler, ListDomainsHandler, ListMetricsHandler,
    ListSystemModulesHandler, ListInstalledModulesHandler,
    CreateTaxConfigHandler, UpdateTaxConfigHandler, DeleteTaxConfigHandler, ListTaxConfigsHandler,
    CreateLanguageHandler, UpdateLanguageHandler, DeleteLanguageHandler, ListLanguagesHandler, SetDefaultLanguageHandler,
    CreateCurrencyHandler, UpdateCurrencyHandler, DeleteCurrencyHandler, ListCurrenciesHandler, SetBaseCurrencyHandler,
    CreateApiKeyHandler, RevokeApiKeyHandler, ListApiKeysHandler,
    CreateWebhookHandler, UpdateWebhookHandler, DeleteWebhookHandler, ListWebhooksHandler, GetWebhookHandler,
    CreateExchangeRateHandler, ListExchangeRatesHandler,
    CreateTranslationHandler, UpdateTranslationHandler, DeleteTranslationHandler, ListTranslationsHandler,
    ListAuditLogsHandler,
    GetParameterHandler, SetParameterHandler,
    { provide: TenantsRepository, useClass: DrizzleTenantsRepository },
  ],
  exports: [TenantsRepository],
})
export class TenantsModule {}
