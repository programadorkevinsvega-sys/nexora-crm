import { Injectable } from '@nestjs/common'
import { PipelineRepository } from '../../domain/repositories/pipeline.repository'
import { PipelineStageRepository } from '../../domain/repositories/pipeline-stage.repository'
import { DealRepository } from '../../domain/repositories/deal.repository'
import { Pipeline } from '../../domain/entities/pipeline.entity'
import { PipelineStage } from '../../domain/entities/pipeline-stage.entity'
import { Deal } from '../../domain/entities/deal.entity'
import {
  CreatePipelineCommand, UpdatePipelineCommand, DeletePipelineCommand,
  CreateStageCommand, ReorderStagesCommand,
  CreateDealCommand, UpdateDealCommand, MoveDealCommand, WinDealCommand, LoseDealCommand, DeleteDealCommand,
} from './pipeline.commands'
import {
  PipelineCreatedEvent, PipelineDeletedEvent,
  DealCreatedEvent, DealUpdatedEvent, DealMovedEvent, DealWonEvent, DealLostEvent,
} from '../../domain/events/pipeline.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { NotFoundError, ConflictError } from '@crm/shared'

@Injectable()
export class CreatePipelineHandler {
  constructor(
    private readonly repo: PipelineRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreatePipelineCommand): Promise<{ id: string }> {
    const pipeline = Pipeline.create({ tenantId: command.tenantId, name: command.name })
    await this.repo.save(pipeline)
    await this.outbox.publish(new PipelineCreatedEvent(pipeline.id, pipeline.name))
    return { id: pipeline.id }
  }
}

@Injectable()
export class UpdatePipelineHandler {
  constructor(
    private readonly repo: PipelineRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UpdatePipelineCommand): Promise<void> {
    const pipeline = await this.repo.findById(command.tenantId, command.id)
    if (!pipeline) throw new NotFoundError('Pipeline', command.id)
    const updated = pipeline.update({ name: command.name })
    await this.repo.save(updated)
  }
}

@Injectable()
export class DeletePipelineHandler {
  constructor(
    private readonly repo: PipelineRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: DeletePipelineCommand): Promise<void> {
    await this.repo.delete(command.tenantId, command.id)
    await this.outbox.publish(new PipelineDeletedEvent(command.id))
  }
}

@Injectable()
export class CreateStageHandler {
  constructor(
    private readonly stageRepo: PipelineStageRepository,
    private readonly pipelineRepo: PipelineRepository,
  ) {}

  async execute(command: CreateStageCommand): Promise<{ id: string }> {
    const pipeline = await this.pipelineRepo.findById(command.tenantId, command.pipelineId)
    if (!pipeline) throw new NotFoundError('Pipeline', command.pipelineId)

    const stages = await this.stageRepo.listOrdered(command.tenantId, command.pipelineId)
    const displayOrder = command.displayOrder ?? stages.length

    const stage = PipelineStage.create({
      tenantId: command.tenantId,
      pipelineId: command.pipelineId,
      name: command.name,
      probabilityPercent: command.probabilityPercent,
      displayOrder,
    })
    await this.stageRepo.save(stage)
    return { id: stage.id }
  }
}

@Injectable()
export class ReorderStagesHandler {
  constructor(private readonly stageRepo: PipelineStageRepository) {}

  async execute(command: ReorderStagesCommand): Promise<void> {
    await this.stageRepo.reorder(command.tenantId, command.pipelineId, command.stageIds)
  }
}

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
    await this.outbox.publish(new DealWonEvent(won.id, won.amount))
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
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: DeleteDealCommand): Promise<void> {
    await this.dealRepo.delete(command.tenantId, command.id)
  }
}
