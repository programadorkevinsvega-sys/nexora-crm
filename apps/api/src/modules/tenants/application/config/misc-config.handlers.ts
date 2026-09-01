import { Injectable } from '@nestjs/common'
import { TenantsRepository } from '../../domain/repositories/tenants.repository'
import { ExchangeRate, Translation, SystemAuditLog, SystemParameter } from '../../domain/entities/config.entity'

export class CreateExchangeRateCommand {
  constructor(
    readonly tenantId: string,
    readonly fromCurrencyId: string,
    readonly toCurrencyId: string,
    readonly rate: number,
    readonly effectiveDate?: string,
  ) {}
}

export class ListExchangeRatesQuery {
  constructor(readonly tenantId: string) {}
}

@Injectable()
export class CreateExchangeRateHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(cmd: CreateExchangeRateCommand): Promise<ExchangeRate> {
    const rate = ExchangeRate.create({
      tenantId: cmd.tenantId,
      fromCurrencyId: cmd.fromCurrencyId,
      toCurrencyId: cmd.toCurrencyId,
      rate: cmd.rate,
      effectiveDate: cmd.effectiveDate ? new Date(cmd.effectiveDate) : undefined,
    })
    await this.repo.saveExchangeRate(rate)
    return rate
  }
}

@Injectable()
export class ListExchangeRatesHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(q: ListExchangeRatesQuery): Promise<ExchangeRate[]> {
    return this.repo.listExchangeRates(q.tenantId)
  }
}

// ─── Translations ───

export class CreateTranslationCommand {
  constructor(
    readonly tenantId: string,
    readonly languageId: string,
    readonly translationKey: string,
    readonly translationValue: string,
  ) {}
}

export class UpdateTranslationCommand {
  constructor(readonly id: string, readonly tenantId: string, readonly translationValue: string) {}
}

export class DeleteTranslationCommand {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListTranslationsQuery {
  constructor(readonly tenantId: string, readonly languageId?: string) {}
}

@Injectable()
export class CreateTranslationHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(cmd: CreateTranslationCommand): Promise<Translation> {
    const t = Translation.create({
      tenantId: cmd.tenantId,
      languageId: cmd.languageId,
      translationKey: cmd.translationKey,
      translationValue: cmd.translationValue,
    })
    await this.repo.saveTranslation(t)
    return t
  }
}

@Injectable()
export class UpdateTranslationHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(cmd: UpdateTranslationCommand): Promise<Translation> {
    const t = await this.repo.findTranslationById(cmd.id)
    if (!t) throw new Error('Translation not found')
    const updated = new Translation(t.id, t.tenantId, t.languageId, t.translationKey, cmd.translationValue, t.createdAt)
    await this.repo.saveTranslation(updated)
    return updated
  }
}

@Injectable()
export class DeleteTranslationHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(cmd: DeleteTranslationCommand): Promise<void> {
    await this.repo.deleteTranslation(cmd.tenantId, cmd.id)
  }
}

@Injectable()
export class ListTranslationsHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(q: ListTranslationsQuery): Promise<Translation[]> {
    return this.repo.listTranslations(q.tenantId, q.languageId)
  }
}

// ─── Audit Logs ───

export class ListAuditLogsQuery {
  constructor(
    readonly tenantId: string,
    readonly moduleName?: string,
    readonly cursor?: string,
    readonly limit?: number,
  ) {}
}

@Injectable()
export class ListAuditLogsHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(q: ListAuditLogsQuery): Promise<{ data: SystemAuditLog[]; nextCursor: string | null }> {
    return this.repo.listAuditLogs(q.tenantId, q.moduleName, q.cursor, q.limit)
  }
}

// ─── System Parameters ───

export class GetParameterQuery {
  constructor(readonly paramKey: string) {}
}

export class SetParameterCommand {
  constructor(
    readonly paramKey: string,
    readonly paramValue: string,
    readonly description?: string,
    readonly dataType?: string,
    readonly isPublic?: boolean,
  ) {}
}

@Injectable()
export class GetParameterHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(q: GetParameterQuery): Promise<SystemParameter | null> {
    return this.repo.getParameter(q.paramKey)
  }
}

@Injectable()
export class SetParameterHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(cmd: SetParameterCommand): Promise<SystemParameter> {
    const param = SystemParameter.create({
      paramKey: cmd.paramKey,
      paramValue: cmd.paramValue,
      description: cmd.description,
      dataType: cmd.dataType,
      isPublic: cmd.isPublic,
    })
    await this.repo.setParameter(param)
    return param
  }
}
