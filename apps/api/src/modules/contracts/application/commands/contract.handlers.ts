import { Injectable } from '@nestjs/common'
import { ContractRepository } from '../../domain/repositories/contract.repository'
import { Contract, ContractStatus } from '../../domain/entities/contract.entity'
import { CreateContractCommand, UpdateContractCommand, RenewContractCommand, UpdateContractStatusCommand } from './contract.commands'
import { ContractCreatedEvent, ContractRenewedEvent, ContractStatusChangedEvent } from '../../domain/events/contract.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { NotFoundError, ConflictError } from '@crm/shared'

@Injectable()
export class CreateContractHandler {
  constructor(
    private readonly repo: ContractRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateContractCommand): Promise<{ id: string }> {
    const contract = Contract.create({
      tenantId: command.tenantId,
      companyId: command.companyId,
      dealId: command.dealId,
      name: command.name,
      startDate: command.startDate,
      endDate: command.endDate,
      autoRenew: command.autoRenew,
      mrrValue: command.mrrValue,
      ownerUserId: command.ownerUserId,
    })

    await this.repo.save(contract)
    await this.outbox.publish(new ContractCreatedEvent(contract.id, contract.name, contract.companyId))

    return { id: contract.id }
  }
}

@Injectable()
export class UpdateContractHandler {
  constructor(
    private readonly repo: ContractRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UpdateContractCommand): Promise<void> {
    const contract = await this.repo.findById(command.tenantId, command.id)
    if (!contract) throw new NotFoundError('Contract', command.id)

    const updated = contract.update(command)
    await this.repo.save(updated)
  }
}

@Injectable()
export class RenewContractHandler {
  constructor(
    private readonly repo: ContractRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: RenewContractCommand): Promise<void> {
    const contract = await this.repo.findById(command.tenantId, command.id)
    if (!contract) throw new NotFoundError('Contract', command.id)
    if (!['ACTIVE', 'EXPIRED'].includes(contract.status)) throw new ConflictError('Only active or expired contracts can be renewed')

    const updated = contract.updateStatus('RENEWED')
    await this.repo.save(updated)
    await this.outbox.publish(new ContractRenewedEvent(updated.id))
  }
}

@Injectable()
export class UpdateContractStatusHandler {
  constructor(
    private readonly repo: ContractRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UpdateContractStatusCommand): Promise<void> {
    const contract = await this.repo.findById(command.tenantId, command.id)
    if (!contract) throw new NotFoundError('Contract', command.id)

    const oldStatus = contract.status
    const newStatus = command.status as ContractStatus
    const updated = contract.updateStatus(newStatus)
    await this.repo.save(updated)
    await this.outbox.publish(new ContractStatusChangedEvent(updated.id, oldStatus, newStatus))
  }
}
