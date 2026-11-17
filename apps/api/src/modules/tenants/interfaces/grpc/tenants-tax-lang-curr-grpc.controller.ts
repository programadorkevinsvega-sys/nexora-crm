/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateTaxConfigHandler, UpdateTaxConfigHandler, DeleteTaxConfigHandler, ListTaxConfigsHandler,
  CreateLanguageHandler, UpdateLanguageHandler, DeleteLanguageHandler, ListLanguagesHandler, SetDefaultLanguageHandler,
  CreateCurrencyHandler, UpdateCurrencyHandler, DeleteCurrencyHandler, ListCurrenciesHandler, SetBaseCurrencyHandler,
} from '../../application/config.handlers'
import {
  CreateTaxConfigCommand, UpdateTaxConfigCommand, DeleteTaxConfigCommand, ListTaxConfigsQuery,
  CreateLanguageCommand, UpdateLanguageCommand, DeleteLanguageCommand, ListLanguagesQuery, SetDefaultLanguageCommand,
  CreateCurrencyCommand, UpdateCurrencyCommand, DeleteCurrencyCommand, ListCurrenciesQuery, SetBaseCurrencyCommand,
} from '../../application/config.handlers'
import { TenantsMapper } from '../../infrastructure/tenants.mapper'

@Controller()
export class TenantsTaxLangCurrGrpcController {
  constructor(
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
  ) {}

  @GrpcMethod('TenantService', 'CreateTaxConfig')
  async createTaxConfig(data: any) {
    const result = await this.createTaxConfigHandler.execute(
      new CreateTaxConfigCommand(data.tenantId, data.taxName, data.taxPercentage, data.description, data.taxType),
    )
    return { json: JSON.stringify(TenantsMapper.taxConfigToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'ListTaxConfigs')
  async listTaxConfigs(data: { tenantId: string }) {
    const result = await this.listTaxConfigsHandler.execute(new ListTaxConfigsQuery(data.tenantId))
    return { jsonItems: result.map((c) => JSON.stringify(TenantsMapper.taxConfigToResponse(c))) }
  }

  @GrpcMethod('TenantService', 'UpdateTaxConfig')
  async updateTaxConfig(data: any) {
    const result = await this.updateTaxConfigHandler.execute(
      new UpdateTaxConfigCommand(data.id, data.tenantId, data.taxName, data.taxPercentage, data.description, data.taxType, data.isActive),
    )
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
      new CreateLanguageCommand(data.tenantId, data.isoCode, data.name, data.isDefault),
    )
    return { json: JSON.stringify(TenantsMapper.languageToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'ListLanguages')
  async listLanguages(data: { tenantId: string }) {
    const result = await this.listLanguagesHandler.execute(new ListLanguagesQuery(data.tenantId))
    return { jsonItems: result.map((l) => JSON.stringify(TenantsMapper.languageToResponse(l))) }
  }

  @GrpcMethod('TenantService', 'UpdateLanguage')
  async updateLanguage(data: any) {
    const result = await this.updateLanguageHandler.execute(
      new UpdateLanguageCommand(data.id, data.tenantId, data.isoCode, data.name, data.isDefault, data.isActive),
    )
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
      new CreateCurrencyCommand(data.tenantId, data.isoCode, data.name, data.symbol, data.isBaseCurrency),
    )
    return { json: JSON.stringify(TenantsMapper.currencyToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'ListCurrencies')
  async listCurrencies(data: { tenantId: string }) {
    const result = await this.listCurrenciesHandler.execute(new ListCurrenciesQuery(data.tenantId))
    return { jsonItems: result.map((c) => JSON.stringify(TenantsMapper.currencyToResponse(c))) }
  }

  @GrpcMethod('TenantService', 'UpdateCurrency')
  async updateCurrency(data: any) {
    const result = await this.updateCurrencyHandler.execute(
      new UpdateCurrencyCommand(data.id, data.tenantId, data.isoCode, data.name, data.symbol, data.isBaseCurrency, data.isActive),
    )
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
}
