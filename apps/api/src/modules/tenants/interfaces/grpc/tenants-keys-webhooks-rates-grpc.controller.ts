import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateApiKeyHandler, RevokeApiKeyHandler, ListApiKeysHandler,
  CreateWebhookHandler, UpdateWebhookHandler, DeleteWebhookHandler, ListWebhooksHandler, GetWebhookHandler,
  CreateExchangeRateHandler, ListExchangeRatesHandler,
  CreateTranslationHandler, UpdateTranslationHandler, DeleteTranslationHandler, ListTranslationsHandler,
  ListAuditLogsHandler,
  GetParameterHandler, SetParameterHandler,
} from '../../application/config.handlers'
import {
  CreateApiKeyCommand, RevokeApiKeyCommand, ListApiKeysQuery,
  CreateWebhookCommand, UpdateWebhookCommand, DeleteWebhookCommand, ListWebhooksQuery, GetWebhookQuery,
  CreateExchangeRateCommand, ListExchangeRatesQuery,
  CreateTranslationCommand, UpdateTranslationCommand, DeleteTranslationCommand, ListTranslationsQuery,
  ListAuditLogsQuery,
  GetParameterQuery, SetParameterCommand,
} from '../../application/config.handlers'
import { TenantsMapper } from '../../infrastructure/tenants.mapper'

interface TenantConfigGrpcRequest {
  tenantId?: unknown
  name?: unknown
  scopes?: unknown
  expiresAt?: unknown
  id?: unknown
  endpointUrl?: unknown
  eventTypes?: unknown
  isActive?: unknown
  maxRetries?: unknown
  fromCurrencyId?: unknown
  toCurrencyId?: unknown
  rate?: unknown
  effectiveDate?: unknown
  languageId?: unknown
  translationKey?: unknown
  translationValue?: unknown
  paramKey?: unknown
  paramValue?: unknown
  description?: unknown
  dataType?: unknown
  isPublic?: unknown
}

function requiredConfigString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) throw new TypeError(`Missing or invalid ${field}`)
  return value
}

function optionalConfigString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function optionalConfigBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
}

function optionalConfigNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function optionalConfigStringArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null) return undefined
  if (!Array.isArray(value) || !value.every((item): item is string => typeof item === 'string')) {
    throw new TypeError('Expected an array of strings')
  }
  return value
}

function optionalConfigDate(value: unknown): Date | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string') throw new TypeError('Expected a date string')
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) throw new TypeError('Invalid date')
  return date
}

function requiredConfigNumber(value: unknown, field: string): number {
  const parsed = optionalConfigNumber(value)
  if (parsed === undefined) throw new TypeError(`Missing or invalid ${field}`)
  return parsed
}

@Controller()
export class TenantsKeysWebhooksRatesGrpcController {
  constructor(
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

  @GrpcMethod('TenantService', 'CreateApiKey')
  async createApiKey(data: TenantConfigGrpcRequest) {
    const { apiKey, rawToken } = await this.createApiKeyHandler.execute(
      new CreateApiKeyCommand(requiredConfigString(data.tenantId, 'tenantId'), requiredConfigString(data.name, 'name'), optionalConfigStringArray(data.scopes), optionalConfigDate(data.expiresAt)),
    )
    return { json: JSON.stringify(TenantsMapper.apiKeyToResponse(apiKey)), rawToken }
  }

  @GrpcMethod('TenantService', 'ListApiKeys')
  async listApiKeys(data: { tenantId: string }) {
    const result = await this.listApiKeysHandler.execute(new ListApiKeysQuery(data.tenantId))
    return { jsonItems: result.map((k) => JSON.stringify(TenantsMapper.apiKeyToResponse(k))) }
  }

  @GrpcMethod('TenantService', 'RevokeApiKey')
  async revokeApiKey(data: { tenantId: string; id: string }) {
    await this.revokeApiKeyHandler.execute(new RevokeApiKeyCommand(data.tenantId, data.id))
    return {}
  }

  @GrpcMethod('TenantService', 'CreateWebhook')
  async createWebhook(data: TenantConfigGrpcRequest) {
    const result = await this.createWebhookHandler.execute(
      new CreateWebhookCommand(requiredConfigString(data.tenantId, 'tenantId'), requiredConfigString(data.name, 'name'), requiredConfigString(data.endpointUrl, 'endpointUrl'), optionalConfigStringArray(data.eventTypes)),
    )
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
    return { jsonItems: result.map((w) => JSON.stringify(TenantsMapper.webhookToResponse(w))) }
  }

  @GrpcMethod('TenantService', 'UpdateWebhook')
  async updateWebhook(data: TenantConfigGrpcRequest) {
    const result = await this.updateWebhookHandler.execute(
      new UpdateWebhookCommand(requiredConfigString(data.id, 'id'), requiredConfigString(data.tenantId, 'tenantId'), optionalConfigString(data.name), optionalConfigString(data.endpointUrl), optionalConfigBoolean(data.isActive), optionalConfigNumber(data.maxRetries), optionalConfigStringArray(data.eventTypes)),
    )
    return { json: JSON.stringify(TenantsMapper.webhookToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'DeleteWebhook')
  async deleteWebhook(data: { tenantId: string; id: string }) {
    await this.deleteWebhookHandler.execute(new DeleteWebhookCommand(data.tenantId, data.id))
    return {}
  }

  @GrpcMethod('TenantService', 'CreateExchangeRate')
  async createExchangeRate(data: TenantConfigGrpcRequest) {
    const result = await this.createExchangeRateHandler.execute(
      new CreateExchangeRateCommand(requiredConfigString(data.tenantId, 'tenantId'), requiredConfigString(data.fromCurrencyId, 'fromCurrencyId'), requiredConfigString(data.toCurrencyId, 'toCurrencyId'), requiredConfigNumber(data.rate, 'rate'), optionalConfigString(data.effectiveDate)),
    )
    return { json: JSON.stringify(TenantsMapper.exchangeRateToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'ListExchangeRates')
  async listExchangeRates(data: { tenantId: string }) {
    const result = await this.listExchangeRatesHandler.execute(new ListExchangeRatesQuery(data.tenantId))
    return { jsonItems: result.map((r) => JSON.stringify(TenantsMapper.exchangeRateToResponse(r))) }
  }

  @GrpcMethod('TenantService', 'CreateTranslation')
  async createTranslation(data: TenantConfigGrpcRequest) {
    const result = await this.createTranslationHandler.execute(
      new CreateTranslationCommand(requiredConfigString(data.tenantId, 'tenantId'), requiredConfigString(data.languageId, 'languageId'), requiredConfigString(data.translationKey, 'translationKey'), requiredConfigString(data.translationValue, 'translationValue')),
    )
    return { json: JSON.stringify(TenantsMapper.translationToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'ListTranslations')
  async listTranslations(data: { tenantId: string; languageId?: string }) {
    const result = await this.listTranslationsHandler.execute(new ListTranslationsQuery(data.tenantId, data.languageId))
    return { jsonItems: result.map((t) => JSON.stringify(TenantsMapper.translationToResponse(t))) }
  }

  @GrpcMethod('TenantService', 'UpdateTranslation')
  async updateTranslation(data: { id: string; tenantId: string; translationValue: string }) {
    const result = await this.updateTranslationHandler.execute(
      new UpdateTranslationCommand(data.id, data.tenantId, data.translationValue),
    )
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
    return { jsonItems: result.data.map((l) => JSON.stringify(TenantsMapper.auditLogToResponse(l))), nextCursor: result.nextCursor ?? '' }
  }

  @GrpcMethod('TenantService', 'GetParameter')
  async getParameter(data: { paramKey: string }) {
    const result = await this.getParameterHandler.execute(new GetParameterQuery(data.paramKey))
    if (!result) return {}
    return { json: JSON.stringify(TenantsMapper.sysParamToResponse(result)) }
  }

  @GrpcMethod('TenantService', 'SetParameter')
  async setParameter(data: TenantConfigGrpcRequest) {
    await this.setParameterHandler.execute(
      new SetParameterCommand(requiredConfigString(data.paramKey, 'paramKey'), requiredConfigString(data.paramValue, 'paramValue'), optionalConfigString(data.description), optionalConfigString(data.dataType), optionalConfigBoolean(data.isPublic)),
    )
    return {}
  }
}
