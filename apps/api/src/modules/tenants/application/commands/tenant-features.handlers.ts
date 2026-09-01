import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { TenantsRepository } from '../../domain/repositories/tenants.repository'
import { TenantBranding } from '../../domain/entities/branding.entity'
import { TenantDomain, UsageMetric } from '../../domain/entities/features.entity'
import { InstalledModule } from '../../domain/entities/modules.entity'
import {
  UpdateBrandingCommand, ToggleFeatureCommand,
  CreateDomainCommand, DeleteDomainCommand, SetPrimaryDomainCommand,
  UpsertMetricCommand, InstallModuleCommand, UninstallModuleCommand,
} from './tenants.commands'
import { ModuleInstalledEvent, ModuleUninstalledEvent } from '../../domain/events/tenants.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Injectable()
export class UpdateBrandingHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(command: UpdateBrandingCommand): Promise<void> {
    const branding = TenantBranding.create({
      tenantId: command.tenantId,
      logoUrl: command.logoUrl,
      faviconUrl: command.faviconUrl,
      primaryColor: command.primaryColor,
      secondaryColor: command.secondaryColor,
      customDomain: command.customDomain,
    })
    await this.repo.saveBranding(branding)
  }
}

@Injectable()
export class ToggleFeatureHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(command: ToggleFeatureCommand): Promise<void> {
    await this.repo.toggleFeature(command.tenantId, command.featureCode, command.isEnabled)
  }
}

@Injectable()
export class CreateDomainHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(command: CreateDomainCommand): Promise<void> {
    if (command.isPrimary) {
      await this.repo.setPrimaryDomain(command.tenantId, '')
    }
    const domain = TenantDomain.create({
      tenantId: command.tenantId,
      domain: command.domain,
      isPrimary: command.isPrimary,
    })
    await this.repo.saveDomain(domain)
  }
}

@Injectable()
export class DeleteDomainHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(command: DeleteDomainCommand): Promise<void> {
    await this.repo.deleteDomain(command.tenantId, command.id)
  }
}

@Injectable()
export class SetPrimaryDomainHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(command: SetPrimaryDomainCommand): Promise<void> {
    await this.repo.setPrimaryDomain(command.tenantId, command.domainId)
  }
}

@Injectable()
export class UpsertMetricHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(command: UpsertMetricCommand): Promise<UsageMetric> {
    const metric = UsageMetric.create({
      tenantId: command.tenantId,
      metricName: command.metricName,
      currentValue: command.currentValue,
      limitValue: command.limitValue,
      periodStart: new Date(command.periodStart ?? Date.now()),
      periodEnd: new Date(command.periodEnd ?? Date.now()),
    })
    await this.repo.upsertMetric(metric)
    return metric
  }
}

@Injectable()
export class InstallModuleHandler {
  constructor(
    private readonly repo: TenantsRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: InstallModuleCommand): Promise<void> {
    const mod = await this.repo.findSystemModuleById(command.moduleId)
    if (!mod) throw new NotFoundException('Module not found')

    const existing = await this.repo.findInstalledModule(command.tenantId, command.moduleId)
    if (existing) throw new ConflictException('Module already installed')

    const installed = InstalledModule.create({
      tenantId: command.tenantId,
      moduleId: command.moduleId,
    })
    await this.repo.installModule(installed)
    await this.outbox.publish(new ModuleInstalledEvent(installed.id, command.tenantId, command.moduleId))
  }
}

@Injectable()
export class UninstallModuleHandler {
  constructor(
    private readonly repo: TenantsRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UninstallModuleCommand): Promise<void> {
    const existing = await this.repo.findInstalledModule(command.tenantId, command.moduleId)
    if (!existing) throw new NotFoundException('Module not installed')

    await this.repo.uninstallModule(command.tenantId, command.moduleId)
    await this.outbox.publish(new ModuleUninstalledEvent(existing.id, command.tenantId, command.moduleId))
  }
}
