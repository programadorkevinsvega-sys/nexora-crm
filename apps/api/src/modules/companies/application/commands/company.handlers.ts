import { Injectable } from '@nestjs/common'
import { CompanyRepository } from '../../domain/repositories/company.repository'
import { Company } from '../../domain/entities/company.entity'
import { CreateCompanyCommand, UpdateCompanyCommand, DeleteCompanyCommand } from './company.commands'
import { CompanyCreatedEvent, CompanyUpdatedEvent, CompanyDeletedEvent } from '../../domain/events/company.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { NotFoundError } from '@crm/shared'

@Injectable()
export class CreateCompanyHandler {
  constructor(
    private readonly repo: CompanyRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateCompanyCommand): Promise<{ id: string }> {
    const company = Company.create({
      tenantId: command.tenantId,
      name: command.name,
      taxId: command.taxId,
      website: command.website,
      industry: command.industry,
      numberOfEmployees: command.numberOfEmployees,
      annualRevenue: command.annualRevenue,
      description: command.description,
      parentCompanyId: command.parentCompanyId,
    })

    await this.repo.save(company)
    await this.outbox.publish(new CompanyCreatedEvent(company.id, company.name))

    return { id: company.id }
  }
}

@Injectable()
export class UpdateCompanyHandler {
  constructor(
    private readonly repo: CompanyRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UpdateCompanyCommand): Promise<void> {
    const company = await this.repo.findById(command.tenantId, command.id)
    if (!company) throw new NotFoundError('Company', command.id)

    const updated = company.update(command)
    await this.repo.save(updated)
    await this.outbox.publish(new CompanyUpdatedEvent(updated.id, updated.name))
  }
}

@Injectable()
export class DeleteCompanyHandler {
  constructor(
    private readonly repo: CompanyRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: DeleteCompanyCommand): Promise<void> {
    await this.repo.delete(command.tenantId, command.id)
    await this.outbox.publish(new CompanyDeletedEvent(command.id))
  }
}
