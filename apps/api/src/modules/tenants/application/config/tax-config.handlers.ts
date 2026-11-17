import { Injectable, NotFoundException } from '@nestjs/common'
import { TenantsRepository } from '../../domain/repositories/tenants.repository'
import { TaxConfiguration } from '../../domain/entities/config.entity'

export class CreateTaxConfigCommand {
  constructor(
    readonly tenantId: string,
    readonly taxName: string,
    readonly taxPercentage: number,
    readonly description?: string,
    readonly taxType?: string,
  ) {}
}

export class UpdateTaxConfigCommand {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly taxName?: string,
    readonly taxPercentage?: number,
    readonly description?: string | null,
    readonly taxType?: string,
    readonly isActive?: boolean,
  ) {}
}

export class DeleteTaxConfigCommand {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListTaxConfigsQuery {
  constructor(readonly tenantId: string) {}
}

@Injectable()
export class CreateTaxConfigHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(cmd: CreateTaxConfigCommand): Promise<TaxConfiguration> {
    const config = TaxConfiguration.create({
      tenantId: cmd.tenantId,
      taxName: cmd.taxName,
      taxPercentage: cmd.taxPercentage,
      description: cmd.description,
      taxType: cmd.taxType,
    })
    await this.repo.saveTaxConfig(config)
    return config
  }
}

@Injectable()
export class UpdateTaxConfigHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(cmd: UpdateTaxConfigCommand): Promise<TaxConfiguration> {
    const config = await this.repo.findTaxConfigById(cmd.id)
    if (!config) throw new NotFoundException('Tax config not found')
    const updated = new TaxConfiguration(
      config.id,
      config.tenantId,
      cmd.taxName ?? config.taxName,
      cmd.taxPercentage ?? config.taxPercentage,
      cmd.description !== undefined ? cmd.description : config.description,
      cmd.taxType ?? config.taxType,
      cmd.isActive ?? config.isActive,
      config.createdAt,
      new Date(),
    )
    await this.repo.saveTaxConfig(updated)
    return updated
  }
}

@Injectable()
export class DeleteTaxConfigHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(cmd: DeleteTaxConfigCommand): Promise<void> {
    await this.repo.deleteTaxConfig(cmd.tenantId, cmd.id)
  }
}

@Injectable()
export class ListTaxConfigsHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(q: ListTaxConfigsQuery): Promise<TaxConfiguration[]> {
    return this.repo.listTaxConfigs(q.tenantId)
  }
}
