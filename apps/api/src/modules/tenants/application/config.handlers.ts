import { Injectable, NotFoundException } from '@nestjs/common'
import { TenantsRepository } from '../domain/repositories/tenants.repository'
import { TaxConfiguration, TenantLanguage, TenantCurrency, TenantApiKey, TenantWebhook, ExchangeRate, Translation, SystemAuditLog, SystemParameter } from '../domain/entities/config.entity'

// ─── Tax Configs ───

export class CreateTaxConfigCommand {
  constructor(readonly tenantId: string, readonly taxName: string, readonly taxPercentage: number, readonly description?: string, readonly taxType?: string) {}
}
export class UpdateTaxConfigCommand {
  constructor(readonly id: string, readonly tenantId: string, readonly taxName?: string, readonly taxPercentage?: number, readonly description?: string | null, readonly taxType?: string, readonly isActive?: boolean) {}
}
export class DeleteTaxConfigCommand { constructor(readonly tenantId: string, readonly id: string) {} }
export class ListTaxConfigsQuery { constructor(readonly tenantId: string) {} }

@Injectable()
export class CreateTaxConfigHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(cmd: CreateTaxConfigCommand): Promise<TaxConfiguration> {
    const config = TaxConfiguration.create({ tenantId: cmd.tenantId, taxName: cmd.taxName, taxPercentage: cmd.taxPercentage, description: cmd.description, taxType: cmd.taxType })
    await this.repo.saveTaxConfig(config); return config
  }
}
@Injectable()
export class UpdateTaxConfigHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(cmd: UpdateTaxConfigCommand): Promise<TaxConfiguration> {
    const config = await this.repo.findTaxConfigById(cmd.id)
    if (!config) throw new NotFoundException('Tax config not found')
    const updated = new TaxConfiguration(config.id, config.tenantId, cmd.taxName ?? config.taxName,
      cmd.taxPercentage ?? config.taxPercentage, cmd.description !== undefined ? cmd.description : config.description,
      cmd.taxType ?? config.taxType, cmd.isActive ?? config.isActive, config.createdAt, new Date())
    await this.repo.saveTaxConfig(updated); return updated
  }
}
@Injectable()
export class DeleteTaxConfigHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(cmd: DeleteTaxConfigCommand): Promise<void> { await this.repo.deleteTaxConfig(cmd.tenantId, cmd.id) }
}
@Injectable()
export class ListTaxConfigsHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(q: ListTaxConfigsQuery): Promise<TaxConfiguration[]> { return this.repo.listTaxConfigs(q.tenantId) }
}

// ─── Languages ───

export class CreateLanguageCommand {
  constructor(readonly tenantId: string, readonly isoCode: string, readonly name: string, readonly isDefault?: boolean) {}
}
export class UpdateLanguageCommand {
  constructor(readonly id: string, readonly tenantId: string, readonly isoCode?: string, readonly name?: string, readonly isDefault?: boolean, readonly isActive?: boolean) {}
}
export class DeleteLanguageCommand { constructor(readonly tenantId: string, readonly id: string) {} }
export class ListLanguagesQuery { constructor(readonly tenantId: string) {} }
export class SetDefaultLanguageCommand { constructor(readonly tenantId: string, readonly languageId: string) {} }

@Injectable()
export class CreateLanguageHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(cmd: CreateLanguageCommand): Promise<TenantLanguage> {
    const lang = TenantLanguage.create({ tenantId: cmd.tenantId, isoCode: cmd.isoCode, name: cmd.name, isDefault: cmd.isDefault })
    await this.repo.saveLanguage(lang); return lang
  }
}
@Injectable()
export class UpdateLanguageHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(cmd: UpdateLanguageCommand): Promise<TenantLanguage> {
    const lang = await this.repo.findLanguageById(cmd.id)
    if (!lang) throw new NotFoundException('Language not found')
    const updated = new TenantLanguage(lang.id, lang.tenantId, cmd.isoCode ?? lang.isoCode,
      cmd.name ?? lang.name, cmd.isDefault ?? lang.isDefault, cmd.isActive ?? lang.isActive,
      lang.createdAt, new Date())
    await this.repo.saveLanguage(updated); return updated
  }
}
@Injectable()
export class DeleteLanguageHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(cmd: DeleteLanguageCommand): Promise<void> { await this.repo.deleteLanguage(cmd.tenantId, cmd.id) }
}
@Injectable()
export class ListLanguagesHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(q: ListLanguagesQuery): Promise<TenantLanguage[]> { return this.repo.listLanguages(q.tenantId) }
}
@Injectable()
export class SetDefaultLanguageHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(cmd: SetDefaultLanguageCommand): Promise<void> { await this.repo.setDefaultLanguage(cmd.tenantId, cmd.languageId) }
}

// ─── Currencies ───

export class CreateCurrencyCommand {
  constructor(readonly tenantId: string, readonly isoCode: string, readonly name: string, readonly symbol: string, readonly isBaseCurrency?: boolean) {}
}
export class UpdateCurrencyCommand {
  constructor(readonly id: string, readonly tenantId: string, readonly isoCode?: string, readonly name?: string, readonly symbol?: string, readonly isBaseCurrency?: boolean, readonly isActive?: boolean) {}
}
export class DeleteCurrencyCommand { constructor(readonly tenantId: string, readonly id: string) {} }
export class ListCurrenciesQuery { constructor(readonly tenantId: string) {} }
export class SetBaseCurrencyCommand { constructor(readonly tenantId: string, readonly currencyId: string) {} }

@Injectable()
export class CreateCurrencyHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(cmd: CreateCurrencyCommand): Promise<TenantCurrency> {
    const curr = TenantCurrency.create({ tenantId: cmd.tenantId, isoCode: cmd.isoCode, name: cmd.name, symbol: cmd.symbol, isBaseCurrency: cmd.isBaseCurrency })
    await this.repo.saveCurrency(curr); return curr
  }
}
@Injectable()
export class UpdateCurrencyHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(cmd: UpdateCurrencyCommand): Promise<TenantCurrency> {
    const curr = await this.repo.findCurrencyById(cmd.id)
    if (!curr) throw new NotFoundException('Currency not found')
    const updated = new TenantCurrency(curr.id, curr.tenantId, cmd.isoCode ?? curr.isoCode,
      cmd.name ?? curr.name, cmd.symbol ?? curr.symbol, cmd.isBaseCurrency ?? curr.isBaseCurrency,
      cmd.isActive ?? curr.isActive, curr.createdAt, new Date())
    await this.repo.saveCurrency(updated); return updated
  }
}
@Injectable()
export class DeleteCurrencyHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(cmd: DeleteCurrencyCommand): Promise<void> { await this.repo.deleteCurrency(cmd.tenantId, cmd.id) }
}
@Injectable()
export class ListCurrenciesHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(q: ListCurrenciesQuery): Promise<TenantCurrency[]> { return this.repo.listCurrencies(q.tenantId) }
}
@Injectable()
export class SetBaseCurrencyHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(cmd: SetBaseCurrencyCommand): Promise<void> { await this.repo.setBaseCurrency(cmd.tenantId, cmd.currencyId) }
}

// ─── API Keys ───

export class CreateApiKeyCommand {
  constructor(readonly tenantId: string, readonly name: string, readonly scopes?: string[], readonly expiresAt?: Date) {}
}
export class RevokeApiKeyCommand { constructor(readonly tenantId: string, readonly id: string) {} }
export class ListApiKeysQuery { constructor(readonly tenantId: string) {} }

@Injectable()
export class CreateApiKeyHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(cmd: CreateApiKeyCommand): Promise<{ apiKey: TenantApiKey; rawToken: string }> {
    const { apiKey, rawToken } = TenantApiKey.create({ tenantId: cmd.tenantId, name: cmd.name, scopes: cmd.scopes, expiresAt: cmd.expiresAt })
    await this.repo.saveApiKey(apiKey); return { apiKey, rawToken }
  }
}
@Injectable()
export class RevokeApiKeyHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(cmd: RevokeApiKeyCommand): Promise<void> { await this.repo.revokeApiKey(cmd.tenantId, cmd.id) }
}
@Injectable()
export class ListApiKeysHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(q: ListApiKeysQuery): Promise<TenantApiKey[]> { return this.repo.listApiKeys(q.tenantId) }
}

// ─── Webhooks ───

export class CreateWebhookCommand {
  constructor(readonly tenantId: string, readonly name: string, readonly endpointUrl: string, readonly eventTypes?: string[]) {}
}
export class UpdateWebhookCommand {
  constructor(readonly id: string, readonly tenantId: string, readonly name?: string, readonly endpointUrl?: string, readonly isActive?: boolean, readonly maxRetries?: number, readonly eventTypes?: string[]) {}
}
export class DeleteWebhookCommand { constructor(readonly tenantId: string, readonly id: string) {} }
export class ListWebhooksQuery { constructor(readonly tenantId: string) {} }
export class GetWebhookQuery { constructor(readonly id: string) {} }

@Injectable()
export class CreateWebhookHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(cmd: CreateWebhookCommand): Promise<TenantWebhook> {
    const wh = TenantWebhook.create({ tenantId: cmd.tenantId, name: cmd.name, endpointUrl: cmd.endpointUrl, eventTypes: cmd.eventTypes })
    await this.repo.saveWebhook(wh); return wh
  }
}
@Injectable()
export class UpdateWebhookHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(cmd: UpdateWebhookCommand): Promise<TenantWebhook> {
    const wh = await this.repo.findWebhookById(cmd.id)
    if (!wh) throw new NotFoundException('Webhook not found')
    const updated = new TenantWebhook(wh.id, wh.tenantId, cmd.name ?? wh.name, cmd.endpointUrl ?? wh.endpointUrl,
      wh.secretKey, cmd.isActive ?? wh.isActive, cmd.maxRetries ?? wh.maxRetries,
      cmd.eventTypes ?? wh.eventTypes, wh.createdAt, new Date())
    await this.repo.saveWebhook(updated); return updated
  }
}
@Injectable()
export class DeleteWebhookHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(cmd: DeleteWebhookCommand): Promise<void> { await this.repo.deleteWebhook(cmd.tenantId, cmd.id) }
}
@Injectable()
export class ListWebhooksHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(q: ListWebhooksQuery): Promise<TenantWebhook[]> { return this.repo.listWebhooks(q.tenantId) }
}
@Injectable()
export class GetWebhookHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(q: GetWebhookQuery): Promise<TenantWebhook> {
    const wh = await this.repo.findWebhookById(q.id)
    if (!wh) throw new NotFoundException('Webhook not found'); return wh
  }
}

// ─── Exchange Rates ───

export class CreateExchangeRateCommand {
  constructor(readonly tenantId: string, readonly fromCurrencyId: string, readonly toCurrencyId: string, readonly rate: number, readonly effectiveDate?: string) {}
}
export class ListExchangeRatesQuery { constructor(readonly tenantId: string) {} }

@Injectable()
export class CreateExchangeRateHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(cmd: CreateExchangeRateCommand): Promise<ExchangeRate> {
    const rate = ExchangeRate.create({ tenantId: cmd.tenantId, fromCurrencyId: cmd.fromCurrencyId, toCurrencyId: cmd.toCurrencyId, rate: cmd.rate, effectiveDate: cmd.effectiveDate ? new Date(cmd.effectiveDate) : undefined })
    await this.repo.saveExchangeRate(rate); return rate
  }
}
@Injectable()
export class ListExchangeRatesHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(q: ListExchangeRatesQuery): Promise<ExchangeRate[]> { return this.repo.listExchangeRates(q.tenantId) }
}

// ─── Translations ───

export class CreateTranslationCommand {
  constructor(readonly tenantId: string, readonly languageId: string, readonly translationKey: string, readonly translationValue: string) {}
}
export class UpdateTranslationCommand {
  constructor(readonly id: string, readonly tenantId: string, readonly translationValue: string) {}
}
export class DeleteTranslationCommand { constructor(readonly tenantId: string, readonly id: string) {} }
export class ListTranslationsQuery { constructor(readonly tenantId: string, readonly languageId?: string) {} }

@Injectable()
export class CreateTranslationHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(cmd: CreateTranslationCommand): Promise<Translation> {
    const t = Translation.create({ tenantId: cmd.tenantId, languageId: cmd.languageId, translationKey: cmd.translationKey, translationValue: cmd.translationValue })
    await this.repo.saveTranslation(t); return t
  }
}
@Injectable()
export class UpdateTranslationHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(cmd: UpdateTranslationCommand): Promise<Translation> {
    const t = await this.repo.findTranslationById(cmd.id)
    if (!t) throw new NotFoundException('Translation not found')
    const updated = new Translation(t.id, t.tenantId, t.languageId, t.translationKey, cmd.translationValue, t.createdAt)
    await this.repo.saveTranslation(updated); return updated
  }
}
@Injectable()
export class DeleteTranslationHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(cmd: DeleteTranslationCommand): Promise<void> { await this.repo.deleteTranslation(cmd.tenantId, cmd.id) }
}
@Injectable()
export class ListTranslationsHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(q: ListTranslationsQuery): Promise<Translation[]> { return this.repo.listTranslations(q.tenantId, q.languageId) }
}

// ─── Audit Logs ───

export class ListAuditLogsQuery {
  constructor(readonly tenantId: string, readonly moduleName?: string, readonly cursor?: string, readonly limit?: number) {}
}
@Injectable()
export class ListAuditLogsHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(q: ListAuditLogsQuery): Promise<{ data: SystemAuditLog[]; nextCursor: string | null }> { return this.repo.listAuditLogs(q.tenantId, q.moduleName, q.cursor, q.limit) }
}

// ─── System Parameters ───

export class GetParameterQuery { constructor(readonly paramKey: string) {} }
export class SetParameterCommand {
  constructor(readonly paramKey: string, readonly paramValue: string, readonly description?: string, readonly dataType?: string, readonly isPublic?: boolean) {}
}

@Injectable()
export class GetParameterHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(q: GetParameterQuery): Promise<SystemParameter | null> { return this.repo.getParameter(q.paramKey) }
}
@Injectable()
export class SetParameterHandler {
  constructor(private readonly repo: TenantsRepository) {}
  async execute(cmd: SetParameterCommand): Promise<SystemParameter> {
    const param = SystemParameter.create({ paramKey: cmd.paramKey, paramValue: cmd.paramValue, description: cmd.description, dataType: cmd.dataType, isPublic: cmd.isPublic })
    await this.repo.setParameter(param); return param
  }
}
