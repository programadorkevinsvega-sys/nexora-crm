import { Injectable } from '@nestjs/common'
import { DealRepository } from '../../domain/repositories/deal.repository'
import { Deal } from '../../domain/entities/deal.entity'
import {
  CreateDealCommand, UpdateDealCommand, MoveDealCommand, WinDealCommand, LoseDealCommand, DeleteDealCommand,
} from './pipeline.commands'
import {
  DealCreatedEvent, DealUpdatedEvent, DealMovedEvent, DealWonEvent, DealLostEvent,
} from '../../domain/events/pipeline.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { NotFoundError } from '@crm/shared'

@Injectable()
export class CreateDealHandler {
  constructor(
    private readonly dealRepo: DealRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateDealCommand): Promise<{ id: string }> {
    const deal = Deal.create({
      tenantId: command.tenantId,
      pipelineId: command.pipelineId,
      stageId: command.stageId,
      contactId: command.contactId,
      companyId: command.companyId,
      name: command.name,
      amount: command.amount,
      expectedCloseDate: command.expectedCloseDate,
      assignedUserId: command.assignedUserId,
    })
    await this.dealRepo.save(deal)
    await this.outbox.publish(new DealCreatedEvent(deal.id, deal.name, deal.amount))
    return { id: deal.id }
  }
}

@Injectable()
export class UpdateDealHandler {
  constructor(
    private readonly dealRepo: DealRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UpdateDealCommand): Promise<void> {
    const deal = await this.dealRepo.findById(command.tenantId, command.id)
    if (!deal) throw new NotFoundError('Deal', command.id)

    const updated = deal.update({
      name: command.name,
      stageId: command.stageId,
      contactId: command.contactId,
      companyId: command.companyId,
      amount: command.amount,
      expectedCloseDate: command.expectedCloseDate,
      assignedUserId: command.assignedUserId,
    })
    await this.dealRepo.save(updated)
    await this.outbox.publish(new DealUpdatedEvent(updated.id, updated.name, updated.amount))
  }
}

@Injectable()
export class MoveDealHandler {
  constructor(
    private readonly dealRepo: DealRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: MoveDealCommand): Promise<void> {
    const deal = await this.dealRepo.findById(command.tenantId, command.id)
    if (!deal) throw new NotFoundError('Deal', command.id)

    const fromStageId = deal.stageId
    const moved = deal.move(command.stageId)
    await this.dealRepo.save(moved)
    await this.outbox.publish(new DealMovedEvent(moved.id, fromStageId, moved.stageId))
  }
}

@Injectable()
export class WinDealHandler {
  constructor(
    private readonly dealRepo: DealRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: WinDealCommand): Promise<void> {
    const deal = await this.dealRepo.findById(command.tenantId, command.id)
    if (!deal) throw new NotFoundError('Deal', command.id)

    const won = deal.win(command.amount)
    await this.dealRepo.save(won)
    await this.outbox.publish(
      new DealWonEvent(
        won.id,
        won.amount,
        won.tenantId,
        won.companyId,
        won.contactId,
        won.name,
      ),
    )
  }
}

@Injectable()
export class LoseDealHandler {
  constructor(
    private readonly dealRepo: DealRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: LoseDealCommand): Promise<void> {
    const deal = await this.dealRepo.findById(command.tenantId, command.id)
    if (!deal) throw new NotFoundError('Deal', command.id)

    const lost = deal.lose(command.reasonId, command.notes)
    await this.dealRepo.save(lost)
    await this.outbox.publish(new DealLostEvent(lost.id, lost.lostReasonId))
  }
}

@Injectable()
export class DeleteDealHandler {
  constructor(
    private readonly dealRepo: DealRepository,
  ) {}

  async execute(command: DeleteDealCommand): Promise<void> {
    await this.dealRepo.delete(command.tenantId, command.id)
  }
}
