import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common'
import { TenantsRepository } from '../../domain/repositories/tenants.repository'
import { Tenant } from '../../domain/entities/tenant.entity'
import { Branch } from '../../domain/entities/branch.entity'
import { TenantBranding } from '../../domain/entities/branding.entity'
import { TenantDomain, UsageMetric } from '../../domain/entities/features.entity'
import { InstalledModule } from '../../domain/entities/modules.entity'
import {
  CreateTenantCommand, UpdateTenantCommand, DeleteTenantCommand,
  CreateBranchCommand, UpdateBranchCommand, DeleteBranchCommand,
  UpdateBrandingCommand, ToggleFeatureCommand,
  CreateDomainCommand, DeleteDomainCommand, SetPrimaryDomainCommand,
  UpsertMetricCommand, InstallModuleCommand, UninstallModuleCommand,
} from './tenants.commands'
import {
  TenantCreatedEvent, TenantUpdatedEvent, TenantDeletedEvent,
  BranchCreatedEvent, BranchUpdatedEvent, BranchDeletedEvent,
  ModuleInstalledEvent, ModuleUninstalledEvent,
} from '../../domain/events/tenants.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Injectable()
export class CreateTenantHandler {
  constructor(private readonly repo: TenantsRepository, private readonly outbox: OutboxService) {}

  async execute(command: CreateTenantCommand): Promise<Tenant> {
    const tenant = Tenant.create({
      name: command.name, legalName: command.legalName, taxId: command.taxId,
      taxRegime: command.taxRegime, legalAddress: command.legalAddress,
      city: command.city, postalCode: command.postalCode,
      industryType: command.industryType, timezone: command.timezone,
      currencyCode: command.currencyCode, ownerUserId: command.ownerUserId,
    })
    await this.repo.saveTenant(tenant)
    await this.outbox.publish(new TenantCreatedEvent(tenant.id, 'tenant.created', tenant.name, tenant.ownerUserId))
    return tenant
  }
}

@Injectable()
export class UpdateTenantHandler {
  constructor(private readonly repo: TenantsRepository, private readonly outbox: OutboxService) {}

  async execute(command: UpdateTenantCommand): Promise<Tenant> {
    const tenant = await this.repo.findTenantById(command.id)
    if (!tenant) throw new NotFoundException('Tenant not found')

    const updated = tenant.update({
      name: command.name, legalName: command.legalName, taxId: command.taxId,
      taxRegime: command.taxRegime, legalAddress: command.legalAddress,
      city: command.city, postalCode: command.postalCode,
      industryType: command.industryType, status: command.status as any,
      timezone: command.timezone, currencyCode: command.currencyCode,
    })
    await this.repo.saveTenant(updated)
    await this.outbox.publish(new TenantUpdatedEvent(updated.id))
    return updated
  }
}

@Injectable()
export class DeleteTenantHandler {
  constructor(private readonly repo: TenantsRepository, private readonly outbox: OutboxService) {}

  async execute(command: DeleteTenantCommand): Promise<void> {
    const tenant = await this.repo.findTenantById(command.id)
    if (!tenant) throw new NotFoundException('Tenant not found')
    if (tenant.status === 'ACTIVE') throw new BadRequestException('Cannot delete active tenant, deactivate first')

    await this.repo.deleteTenant(command.id)
    await this.outbox.publish(new TenantDeletedEvent(command.id))
  }
}

@Injectable()
export class CreateBranchHandler {
  constructor(private readonly repo: TenantsRepository, private readonly outbox: OutboxService) {}

  async execute(command: CreateBranchCommand): Promise<Branch> {
    if (command.isHeadquarters) {
      const existing = await this.repo.listBranches(command.tenantId)
      if (existing.some(b => b.isHeadquarters)) {
        throw new ConflictException('A headquarters branch already exists')
      }
    }
    const branch = Branch.create({
      tenantId: command.tenantId, name: command.name, code: command.code,
      address: command.address, city: command.city, country: command.country,
      isHeadquarters: command.isHeadquarters,
    })
    await this.repo.saveBranch(branch)
    await this.outbox.publish(new BranchCreatedEvent(branch.id, branch.tenantId))
    return branch
  }
}

@Injectable()
export class UpdateBranchHandler {
  constructor(private readonly repo: TenantsRepository, private readonly outbox: OutboxService) {}

  async execute(command: UpdateBranchCommand): Promise<Branch> {
    const branch = await this.repo.findBranchById(command.id)
    if (!branch) throw new NotFoundException('Branch not found')

    const updated = branch.update({
      name: command.name, code: command.code, address: command.address,
      city: command.city, country: command.country,
      isActive: command.isActive, isHeadquarters: command.isHeadquarters,
    })
    await this.repo.saveBranch(updated)
    await this.outbox.publish(new BranchUpdatedEvent(updated.id))
    return updated
  }
}

@Injectable()
export class DeleteBranchHandler {
  constructor(private readonly repo: TenantsRepository, private readonly outbox: OutboxService) {}

  async execute(command: DeleteBranchCommand): Promise<void> {
    const branch = await this.repo.findBranchById(command.id)
    if (!branch) throw new NotFoundException('Branch not found')

    await this.repo.deleteBranch(command.tenantId, command.id)
    await this.outbox.publish(new BranchDeletedEvent(command.id))
  }
}

@Injectable()
export class UpdateBrandingHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(command: UpdateBrandingCommand): Promise<void> {
    const branding = TenantBranding.create({
      tenantId: command.tenantId, logoUrl: command.logoUrl,
      faviconUrl: command.faviconUrl, primaryColor: command.primaryColor,
      secondaryColor: command.secondaryColor, customDomain: command.customDomain,
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
      tenantId: command.tenantId, domain: command.domain, isPrimary: command.isPrimary,
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
      tenantId: command.tenantId, metricName: command.metricName,
      currentValue: command.currentValue, limitValue: command.limitValue,
      periodStart: new Date(command.periodStart ?? Date.now()), periodEnd: new Date(command.periodEnd ?? Date.now()),
    })
    await this.repo.upsertMetric(metric)
    return metric
  }
}

@Injectable()
export class InstallModuleHandler {
  constructor(private readonly repo: TenantsRepository, private readonly outbox: OutboxService) {}

  async execute(command: InstallModuleCommand): Promise<void> {
    const mod = await this.repo.findSystemModuleById(command.moduleId)
    if (!mod) throw new NotFoundException('Module not found')

    const existing = await this.repo.findInstalledModule(command.tenantId, command.moduleId)
    if (existing) throw new ConflictException('Module already installed')

    const installed = InstalledModule.create({
      tenantId: command.tenantId, moduleId: command.moduleId,
    })
    await this.repo.installModule(installed)
    await this.outbox.publish(new ModuleInstalledEvent(installed.id, command.tenantId, command.moduleId))
  }
}

@Injectable()
export class UninstallModuleHandler {
  constructor(private readonly repo: TenantsRepository, private readonly outbox: OutboxService) {}

  async execute(command: UninstallModuleCommand): Promise<void> {
    const existing = await this.repo.findInstalledModule(command.tenantId, command.moduleId)
    if (!existing) throw new NotFoundException('Module not installed')

    await this.repo.uninstallModule(command.tenantId, command.moduleId)
    await this.outbox.publish(new ModuleUninstalledEvent(existing.id, command.tenantId, command.moduleId))
  }
}
