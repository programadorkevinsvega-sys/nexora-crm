import { Injectable } from '@nestjs/common'
import { PipelineRepository } from '../../domain/repositories/pipeline.repository'
import { PipelineStageRepository } from '../../domain/repositories/pipeline-stage.repository'
import { Pipeline } from '../../domain/entities/pipeline.entity'
import { PipelineStage } from '../../domain/entities/pipeline-stage.entity'
import {
  CreatePipelineCommand, UpdatePipelineCommand, DeletePipelineCommand,
  CreateStageCommand, ReorderStagesCommand,
} from './pipeline.commands'
import { PipelineCreatedEvent, PipelineDeletedEvent } from '../../domain/events/pipeline.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { NotFoundError } from '@crm/shared'

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
