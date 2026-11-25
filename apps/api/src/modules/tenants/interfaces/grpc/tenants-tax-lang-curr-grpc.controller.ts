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

interface TenantTaxLocaleGrpcRequest {
  tenantId?: unknown
  id?: unknown
  taxName?: unknown
  taxPercentage?: unknown
  description?: unknown
  taxType?: unknown
  isActive?: unknown
  isoCode?: unknown
  name?: unknown
  isDefault?: unknown
  symbol?: unknown
  isBaseCurrency?: unknown
}

function requiredTaxLocaleString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) throw new TypeError(`Missing or invalid ${field}`)
  return value
}

function optionalTaxLocaleString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function requiredTaxLocaleNumber(value: unknown, field: string): number {
  const number = optionalTaxLocaleNumber(value)
  if (number === undefined) throw new TypeError(`Missing or invalid ${field}`)
  return number
}

function optionalTaxLocaleNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function optionalTaxLocaleBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
}

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
  async createTaxConfig(data: TenantTaxLocaleGrpcRequest) {
    const result = await this.createTaxConfigHandler.execute(
      new CreateTaxConfigCommand(requiredTaxLocaleString(data.tenantId, 'tenantId'), requiredTaxLocaleString(data.taxName, 'taxName'), requiredTaxLocaleNumber(data.taxPercentage, 'taxPercentage'), optionalTaxLocaleString(data.description), optionalTaxLocaleString(data.taxType)),
    )
    return { json: JSON.stringify(TenantsMapper.taxConfigToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'ListTaxConfigs')
  async listTaxConfigs(data: { tenantId: string }) {
    const result = await this.listTaxConfigsHandler.execute(new ListTaxConfigsQuery(data.tenantId))
    return { jsonItems: result.map((c) => JSON.stringify(TenantsMapper.taxConfigToResponse(c))) }
  }

  @GrpcMethod('TenantService', 'UpdateTaxConfig')
  async updateTaxConfig(data: TenantTaxLocaleGrpcRequest) {
    const result = await this.updateTaxConfigHandler.execute(
      new UpdateTaxConfigCommand(requiredTaxLocaleString(data.id, 'id'), requiredTaxLocaleString(data.tenantId, 'tenantId'), optionalTaxLocaleString(data.taxName), optionalTaxLocaleNumber(data.taxPercentage), optionalTaxLocaleString(data.description), optionalTaxLocaleString(data.taxType), optionalTaxLocaleBoolean(data.isActive)),
    )
    return { json: JSON.stringify(TenantsMapper.taxConfigToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'DeleteTaxConfig')
  async deleteTaxConfig(data: { tenantId: string; id: string }) {
    await this.deleteTaxConfigHandler.execute(new DeleteTaxConfigCommand(data.tenantId, data.id))
    return {}
  }

  @GrpcMethod('TenantService', 'CreateLanguage')
  async createLanguage(data: TenantTaxLocaleGrpcRequest) {
    const result = await this.createLanguageHandler.execute(
      new CreateLanguageCommand(requiredTaxLocaleString(data.tenantId, 'tenantId'), requiredTaxLocaleString(data.isoCode, 'isoCode'), requiredTaxLocaleString(data.name, 'name'), optionalTaxLocaleBoolean(data.isDefault)),
    )
    return { json: JSON.stringify(TenantsMapper.languageToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'ListLanguages')
  async listLanguages(data: { tenantId: string }) {
    const result = await this.listLanguagesHandler.execute(new ListLanguagesQuery(data.tenantId))
    return { jsonItems: result.map((l) => JSON.stringify(TenantsMapper.languageToResponse(l))) }
  }

  @GrpcMethod('TenantService', 'UpdateLanguage')
  async updateLanguage(data: TenantTaxLocaleGrpcRequest) {
    const result = await this.updateLanguageHandler.execute(
      new UpdateLanguageCommand(requiredTaxLocaleString(data.id, 'id'), requiredTaxLocaleString(data.tenantId, 'tenantId'), optionalTaxLocaleString(data.isoCode), optionalTaxLocaleString(data.name), optionalTaxLocaleBoolean(data.isDefault), optionalTaxLocaleBoolean(data.isActive)),
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
  async createCurrency(data: TenantTaxLocaleGrpcRequest) {
    const result = await this.createCurrencyHandler.execute(
      new CreateCurrencyCommand(requiredTaxLocaleString(data.tenantId, 'tenantId'), requiredTaxLocaleString(data.isoCode, 'isoCode'), requiredTaxLocaleString(data.name, 'name'), requiredTaxLocaleString(data.symbol, 'symbol'), optionalTaxLocaleBoolean(data.isBaseCurrency)),
    )
    return { json: JSON.stringify(TenantsMapper.currencyToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'ListCurrencies')
  async listCurrencies(data: { tenantId: string }) {
    const result = await this.listCurrenciesHandler.execute(new ListCurrenciesQuery(data.tenantId))
    return { jsonItems: result.map((c) => JSON.stringify(TenantsMapper.currencyToResponse(c))) }
  }

  @GrpcMethod('TenantService', 'UpdateCurrency')
  async updateCurrency(data: TenantTaxLocaleGrpcRequest) {
    const result = await this.updateCurrencyHandler.execute(
      new UpdateCurrencyCommand(requiredTaxLocaleString(data.id, 'id'), requiredTaxLocaleString(data.tenantId, 'tenantId'), optionalTaxLocaleString(data.isoCode), optionalTaxLocaleString(data.name), optionalTaxLocaleString(data.symbol), optionalTaxLocaleBoolean(data.isBaseCurrency), optionalTaxLocaleBoolean(data.isActive)),
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
