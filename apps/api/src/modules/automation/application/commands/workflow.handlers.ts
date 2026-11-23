import { Injectable, Logger } from '@nestjs/common'
import {
  CreateWorkflowCommand,
  ActivateWorkflowCommand,
  PauseWorkflowCommand,
  CreateWorkflowVersionCommand,
  TriggerEventCommand,
  CancelExecutionCommand,
} from './workflow.commands'
import { WorkflowDefinitionRepository } from '../../domain/repositories/workflow-definition.repository'
import { WorkflowExecutionRepository } from '../../domain/repositories/workflow-execution.repository'
import { WorkflowDefinition } from '../../domain/entities/workflow-definition.entity'
import { WorkflowExecution } from '../../domain/entities/workflow-execution.entity'
import { ConditionEvaluator } from '../../domain/services/condition-evaluator.service'
import { WorkflowQueueService } from '../../infrastructure/workflow-queue.service'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import {
  WorkflowExecutionStartedEvent,
  WorkflowExecutionCancelledEvent,
} from '../../domain/events/workflow.events'
import { NotFoundError } from '@crm/shared'

@Injectable()
export class CreateWorkflowHandler {
  constructor(private readonly repo: WorkflowDefinitionRepository) {}

  async execute(command: CreateWorkflowCommand): Promise<{ id: string }> {
    const workflow = WorkflowDefinition.create({
      tenantId: command.tenantId,
      name: command.name,
      description: command.description,
      triggerEvent: command.triggerEvent,
      triggerFilter: command.triggerFilter,
      stepsGraph: command.stepsGraph,
    })
    await this.repo.save(workflow)
    return { id: workflow.id }
  }
}

@Injectable()
export class ActivateWorkflowHandler {
  constructor(private readonly repo: WorkflowDefinitionRepository) {}

  async execute(command: ActivateWorkflowCommand): Promise<void> {
    const workflow = await this.repo.findById(command.tenantId, command.workflowId)
    if (!workflow) throw new NotFoundError('WorkflowDefinition', command.workflowId)
    await this.repo.save(workflow.activate())
  }
}

@Injectable()
export class PauseWorkflowHandler {
  constructor(private readonly repo: WorkflowDefinitionRepository) {}

  async execute(command: PauseWorkflowCommand): Promise<void> {
    const workflow = await this.repo.findById(command.tenantId, command.workflowId)
    if (!workflow) throw new NotFoundError('WorkflowDefinition', command.workflowId)
    await this.repo.save(workflow.pause())
  }
}

@Injectable()
export class CreateWorkflowVersionHandler {
  constructor(private readonly repo: WorkflowDefinitionRepository) {}

  async execute(command: CreateWorkflowVersionCommand): Promise<{ id: string; version: number }> {
    const workflow = await this.repo.findById(command.tenantId, command.workflowId)
    if (!workflow) throw new NotFoundError('WorkflowDefinition', command.workflowId)

    const newVersion = workflow.cloneAsNewVersion(command.overrides)
    await this.repo.save(newVersion)
    return { id: newVersion.id, version: newVersion.version }
  }
}

@Injectable()
export class TriggerEventHandler {
  private readonly logger = new Logger(TriggerEventHandler.name)

  constructor(
    private readonly definitionRepo: WorkflowDefinitionRepository,
    private readonly executionRepo: WorkflowExecutionRepository,
    private readonly workflowQueue: WorkflowQueueService,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: TriggerEventCommand): Promise<{ triggeredCount: number }> {
    const activeWorkflows = await this.definitionRepo.findActiveByTrigger(
      command.tenantId,
      command.eventName,
    )

    let triggeredCount = 0

    for (const definition of activeWorkflows) {
      const matchesFilter = ConditionEvaluator.evaluateFilter(
        definition.triggerFilter,
        command.payload,
      )
      if (!matchesFilter) continue

      const initialStep = definition.stepsGraph[0]
      if (!initialStep) continue

      const execution = WorkflowExecution.start({
        tenantId: command.tenantId,
        workflowId: definition.id,
        version: definition.version,
        entityType: command.entityType,
        entityId: command.entityId,
        initialStepId: initialStep.id,
        initialContext: command.payload,
      })

      await this.executionRepo.save(execution)
      await this.outbox.publish(
        new WorkflowExecutionStartedEvent(
          execution.id,
          definition.id,
          command.entityType,
          command.entityId,
          definition.version,
        ),
      )

      try {
        await this.workflowQueue.enqueueExecution(execution)
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error)
        const failed = execution.fail(`Could not enqueue workflow execution: ${reason}`)
        await this.executionRepo.save(failed)
        throw error
      }
      triggeredCount++
    }

    return { triggeredCount }
  }
}

@Injectable()
export class CancelExecutionHandler {
  constructor(
    private readonly executionRepo: WorkflowExecutionRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CancelExecutionCommand): Promise<void> {
    const execution = await this.executionRepo.findById(command.tenantId, command.executionId)
    if (!execution) throw new NotFoundError('WorkflowExecution', command.executionId)

    const cancelled = execution.cancel(command.reason)
    await this.executionRepo.save(cancelled)
    await this.outbox.publish(
      new WorkflowExecutionCancelledEvent(cancelled.id, command.reason ?? 'User cancelled'),
    )
  }
}
