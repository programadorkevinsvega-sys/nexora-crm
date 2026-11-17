import { Injectable, Logger } from '@nestjs/common'
import { WorkflowDefinition } from '../../domain/entities/workflow-definition.entity'
import { WorkflowExecution } from '../../domain/entities/workflow-execution.entity'
import { WorkflowStepExecution } from '../../domain/entities/workflow-step-execution.entity'
import { WorkflowStep } from '@crm/contracts'
import { ConditionEvaluator } from '../../domain/services/condition-evaluator.service'
import { WorkflowExecutionRepository } from '../../domain/repositories/workflow-execution.repository'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import {
  WorkflowStepCompletedEvent,
  WorkflowExecutionCompletedEvent,
} from '../../domain/events/workflow.events'

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name)

  constructor(
    private readonly executionRepo: WorkflowExecutionRepository,
    private readonly outbox: OutboxService,
  ) {}

  async processExecution(
    execution: WorkflowExecution,
    definition: WorkflowDefinition,
  ): Promise<WorkflowExecution> {
    let currentExec = execution

    while (currentExec.status === 'RUNNING') {
      const step = definition.stepsGraph.find((s) => s.id === currentExec.currentStepId)
      if (!step) {
        currentExec = currentExec.complete()
        await this.executionRepo.save(currentExec)
        await this.outbox.publish(
          new WorkflowExecutionCompletedEvent(currentExec.id, definition.id),
        )
        break
      }

      currentExec = await this.executeStep(currentExec, definition, step)
    }

    return currentExec
  }

  private async executeStep(
    execution: WorkflowExecution,
    definition: WorkflowDefinition,
    step: WorkflowStep,
  ): Promise<WorkflowExecution> {
    const stepExec = WorkflowStepExecution.create({
      tenantId: execution.tenantId,
      executionId: execution.id,
      stepId: step.id,
    })
    await this.executionRepo.saveStepExecution(stepExec.markExecuting())

    try {
      if (step.type === 'DELAY') {
        const waitingExec = execution.waitForDelay(step.id)
        await this.executionRepo.save(waitingExec)
        await this.executionRepo.saveStepExecution(
          stepExec.markSuccess({ delayedDuration: step.duration ?? '1h' }),
        )
        return waitingExec
      }

      if (step.type === 'CONDITION' && step.condition) {
        const conditionResult = ConditionEvaluator.evaluate(
          step.condition,
          execution.contextData ?? {},
        )
        const nextStepId = conditionResult ? step.onTrueStepId : step.onFalseStepId
        await this.executionRepo.saveStepExecution(
          stepExec.markSuccess({ conditionMet: conditionResult, nextStepId }),
        )

        if (!nextStepId) {
          const completed = execution.complete()
          await this.executionRepo.save(completed)
          await this.outbox.publish(
            new WorkflowExecutionCompletedEvent(completed.id, definition.id),
          )
          return completed
        }

        const advanced = execution.advanceTo(nextStepId)
        await this.executionRepo.save(advanced)
        return advanced
      }

      // Action Step (ACTION / WEBHOOK / TASK)
      const actionOutput = await this.performAction(execution, step)
      await this.executionRepo.saveStepExecution(stepExec.markSuccess(actionOutput))
      await this.outbox.publish(
        new WorkflowStepCompletedEvent(execution.id, step.id, 'SUCCESS', actionOutput),
      )

      if (!step.nextStepId) {
        const completed = execution.complete()
        await this.executionRepo.save(completed)
        await this.outbox.publish(
          new WorkflowExecutionCompletedEvent(completed.id, definition.id),
        )
        return completed
      }

      const advanced = execution.advanceTo(step.nextStepId)
      await this.executionRepo.save(advanced)
      return advanced
    } catch (err: any) {
      const errorMessage = err?.message ?? String(err)
      this.logger.error(`Error executing step ${step.id} for execution ${execution.id}: ${errorMessage}`)
      await this.executionRepo.saveStepExecution(stepExec.markFailed(errorMessage))
      const failed = execution.fail(errorMessage)
      await this.executionRepo.save(failed)
      return failed
    }
  }

  private async performAction(
    execution: WorkflowExecution,
    step: WorkflowStep,
  ): Promise<Record<string, unknown>> {
    this.logger.log(
      `Performing action [${step.action ?? step.type}] for entity ${execution.entityType}:${execution.entityId}`,
    )
    return {
      action: step.action ?? step.type,
      executedAt: new Date().toISOString(),
      entityId: execution.entityId,
      config: step.config ?? {},
    }
  }
}
