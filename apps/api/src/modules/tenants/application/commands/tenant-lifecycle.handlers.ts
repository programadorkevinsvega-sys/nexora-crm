import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { TenantsRepository } from '../../domain/repositories/tenants.repository'
import { Tenant } from '../../domain/entities/tenant.entity'
import { CreateTenantCommand, UpdateTenantCommand, DeleteTenantCommand } from './tenants.commands'
import { TenantCreatedEvent, TenantUpdatedEvent, TenantDeletedEvent } from '../../domain/events/tenants.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Injectable()
export class CreateTenantHandler {
  constructor(
    private readonly repo: TenantsRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateTenantCommand): Promise<Tenant> {
    const tenant = Tenant.create({
      name: command.name,
      legalName: command.legalName,
      taxId: command.taxId,
      taxRegime: command.taxRegime,
      legalAddress: command.legalAddress,
      city: command.city,
      postalCode: command.postalCode,
      industryType: command.industryType,
      timezone: command.timezone,
      currencyCode: command.currencyCode,
      ownerUserId: command.ownerUserId,
    })
    await this.repo.saveTenant(tenant)
    await this.outbox.publish(
      new TenantCreatedEvent(tenant.id, 'tenant.created', tenant.name, tenant.ownerUserId),
    )
    return tenant
  }
}

@Injectable()
export class UpdateTenantHandler {
  constructor(
    private readonly repo: TenantsRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UpdateTenantCommand): Promise<Tenant> {
    const tenant = await this.repo.findTenantById(command.id)
    if (!tenant) throw new NotFoundException('Tenant not found')

    const updated = tenant.update({
      name: command.name,
      legalName: command.legalName,
      taxId: command.taxId,
      taxRegime: command.taxRegime,
      legalAddress: command.legalAddress,
      city: command.city,
      postalCode: command.postalCode,
      industryType: command.industryType,
      status: command.status as any,
      timezone: command.timezone,
      currencyCode: command.currencyCode,
    })
    await this.repo.saveTenant(updated)
    await this.outbox.publish(new TenantUpdatedEvent(updated.id))
    return updated
  }
}

@Injectable()
export class DeleteTenantHandler {
  constructor(
    private readonly repo: TenantsRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: DeleteTenantCommand): Promise<void> {
    const tenant = await this.repo.findTenantById(command.id)
    if (!tenant) throw new NotFoundException('Tenant not found')
    if (tenant.status === 'ACTIVE') {
      throw new BadRequestException('Cannot delete active tenant, deactivate first')
    }

    await this.repo.deleteTenant(command.id)
    await this.outbox.publish(new TenantDeletedEvent(command.id))
  }
}
