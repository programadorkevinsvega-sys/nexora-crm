import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { TenantsRepository } from '../../domain/repositories/tenants.repository'
import { Branch } from '../../domain/entities/branch.entity'
import { CreateBranchCommand, UpdateBranchCommand, DeleteBranchCommand } from './tenants.commands'
import { BranchCreatedEvent, BranchUpdatedEvent, BranchDeletedEvent } from '../../domain/events/tenants.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Injectable()
export class CreateBranchHandler {
  constructor(
    private readonly repo: TenantsRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateBranchCommand): Promise<Branch> {
    if (command.isHeadquarters) {
      const existing = await this.repo.listBranches(command.tenantId)
      if (existing.some((b) => b.isHeadquarters)) {
        throw new ConflictException('A headquarters branch already exists')
      }
    }
    const branch = Branch.create({
      tenantId: command.tenantId,
      name: command.name,
      code: command.code,
      address: command.address,
      city: command.city,
      country: command.country,
      isHeadquarters: command.isHeadquarters,
    })
    await this.repo.saveBranch(branch)
    await this.outbox.publish(new BranchCreatedEvent(branch.id, branch.tenantId))
    return branch
  }
}

@Injectable()
export class UpdateBranchHandler {
  constructor(
    private readonly repo: TenantsRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UpdateBranchCommand): Promise<Branch> {
    const branch = await this.repo.findBranchById(command.id)
    if (!branch) throw new NotFoundException('Branch not found')

    const updated = branch.update({
      name: command.name,
      code: command.code,
      address: command.address,
      city: command.city,
      country: command.country,
      isActive: command.isActive,
      isHeadquarters: command.isHeadquarters,
    })
    await this.repo.saveBranch(updated)
    await this.outbox.publish(new BranchUpdatedEvent(updated.id))
    return updated
  }
}

@Injectable()
export class DeleteBranchHandler {
  constructor(
    private readonly repo: TenantsRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: DeleteBranchCommand): Promise<void> {
    const branch = await this.repo.findBranchById(command.id)
    if (!branch) throw new NotFoundException('Branch not found')

    await this.repo.deleteBranch(command.tenantId, command.id)
    await this.outbox.publish(new BranchDeletedEvent(command.id))
  }
}
