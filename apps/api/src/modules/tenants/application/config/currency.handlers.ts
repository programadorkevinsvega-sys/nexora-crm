import { Injectable, NotFoundException } from '@nestjs/common'
import { TenantsRepository } from '../../domain/repositories/tenants.repository'
import { TenantCurrency } from '../../domain/entities/config.entity'

export class CreateCurrencyCommand {
  constructor(readonly tenantId: string, readonly isoCode: string, readonly name: string, readonly symbol: string, readonly isBaseCurrency?: boolean) {}
}

export class UpdateCurrencyCommand {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly isoCode?: string,
    readonly name?: string,
    readonly symbol?: string,
    readonly isBaseCurrency?: boolean,
    readonly isActive?: boolean,
  ) {}
}

export class DeleteCurrencyCommand {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListCurrenciesQuery {
  constructor(readonly tenantId: string) {}
}

export class SetBaseCurrencyCommand {
  constructor(readonly tenantId: string, readonly currencyId: string) {}
}

@Injectable()
export class CreateCurrencyHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(cmd: CreateCurrencyCommand): Promise<TenantCurrency> {
    const curr = TenantCurrency.create({
      tenantId: cmd.tenantId,
      isoCode: cmd.isoCode,
      name: cmd.name,
      symbol: cmd.symbol,
      isBaseCurrency: cmd.isBaseCurrency,
    })
    await this.repo.saveCurrency(curr)
    return curr
  }
}

@Injectable()
export class UpdateCurrencyHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(cmd: UpdateCurrencyCommand): Promise<TenantCurrency> {
    const curr = await this.repo.findCurrencyById(cmd.id)
    if (!curr) throw new NotFoundException('Currency not found')
    const updated = new TenantCurrency(
      curr.id,
      curr.tenantId,
      cmd.isoCode ?? curr.isoCode,
      cmd.name ?? curr.name,
      cmd.symbol ?? curr.symbol,
      cmd.isBaseCurrency ?? curr.isBaseCurrency,
      cmd.isActive ?? curr.isActive,
      curr.createdAt,
      new Date(),
    )
    await this.repo.saveCurrency(updated)
    return updated
  }
}

@Injectable()
export class DeleteCurrencyHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(cmd: DeleteCurrencyCommand): Promise<void> {
    await this.repo.deleteCurrency(cmd.tenantId, cmd.id)
  }
}

@Injectable()
export class ListCurrenciesHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(q: ListCurrenciesQuery): Promise<TenantCurrency[]> {
    return this.repo.listCurrencies(q.tenantId)
  }
}

@Injectable()
export class SetBaseCurrencyHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(cmd: SetBaseCurrencyCommand): Promise<void> {
    await this.repo.setBaseCurrency(cmd.tenantId, cmd.currencyId)
  }
}
