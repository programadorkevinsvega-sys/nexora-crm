import { Injectable, Logger } from '@nestjs/common'
import { WorkflowDefinition } from '../../domain/entities/workflow-definition.entity'
import { WorkflowExecution } from '../../domain/entities/workflow-execution.entity'
import { WorkflowStepExecution } from '../../domain/entities/workflow-step-execution.entity'
import { WorkflowStep } from '@crm/contracts'
import { ConditionEvaluator } from '../../domain/services/condition-evaluator.service'
import { parseWorkflowDelay } from '../../domain/services/workflow-delay'
import { WorkflowExecutionRepository } from '../../domain/repositories/workflow-execution.repository'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { WorkflowQueueService } from '../../infrastructure/workflow-queue.service'
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
    private readonly queue: WorkflowQueueService,
  ) {}

  async processExecution(
    execution: WorkflowExecution,
    definition: WorkflowDefinition,
  ): Promise<WorkflowExecution> {
    let currentExec = execution

    while (currentExec.status === 'RUNNING') {
      const step = definition.stepsGraph.find((candidate) => candidate.id === currentExec.currentStepId)
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

  async resumeAfterDelay(
    execution: WorkflowExecution,
    definition: WorkflowDefinition,
    delayStep: WorkflowStep,
  ): Promise<WorkflowExecution> {
    if (execution.status !== 'WAITING_DELAY' || execution.currentStepId !== delayStep.id) {
      throw new Error('Workflow execution is not waiting at the requested delay step')
    }
    if (delayStep.type !== 'DELAY') {
      throw new Error('Only DELAY workflow steps can be resumed')
    }

    const stepHistory = await this.executionRepo.listStepExecutions(
      execution.tenantId,
      execution.id,
    )
    const delayExecution = stepHistory
      .filter((item) => item.stepId === delayStep.id)
      .sort((left, right) => right.attempts - left.attempts)[0]

    if (!delayExecution) {
      throw new Error('Persisted workflow delay step execution was not found')
    }

    await this.executionRepo.saveStepExecution(
      delayExecution.markSuccess({
        delayedDuration: delayStep.duration ?? '1h',
        resumedAt: new Date().toISOString(),
      }),
    )

    if (!delayStep.nextStepId) {
      const completed = execution.complete()
      await this.executionRepo.save(completed)
      await this.outbox.publish(
        new WorkflowExecutionCompletedEvent(completed.id, definition.id),
      )
      return completed
    }

    const resumed = execution.resumeFromDelay(delayStep.nextStepId)
    await this.executionRepo.save(resumed)
    return this.processExecution(resumed, definition)
  }

  private async executeStep(
    execution: WorkflowExecution,
    definition: WorkflowDefinition,
    step: WorkflowStep,
  ): Promise<WorkflowExecution> {
    const history = await this.executionRepo.listStepExecutions(execution.tenantId, execution.id)
    const attempt = history
      .filter((item) => item.stepId === step.id)
      .reduce((max, item) => Math.max(max, item.attempts), 0) + 1

    const stepExec = WorkflowStepExecution.create({
      tenantId: execution.tenantId,
      executionId: execution.id,
      stepId: step.id,
      attempt,
    })
    await this.executionRepo.saveStepExecution(stepExec.markExecuting())

    try {
      if (step.type === 'DELAY') {
        const delayMs = parseWorkflowDelay(step.duration ?? '1h')
        const resumeAt = new Date(Date.now() + delayMs)
        const waitingExec = execution.waitForDelay(step.id, resumeAt)
        await this.executionRepo.save(waitingExec)
        await this.queue.scheduleDelay(waitingExec, step, resumeAt)
        this.logger.log(
          `Scheduled workflow ${execution.id} to resume at ${resumeAt.toISOString()} after ${step.duration ?? '1h'}`,
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

      // Action dispatch itself remains outside this queue/delay delivery.
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error(
        `Error executing step ${step.id} for execution ${execution.id}: ${errorMessage}`,
      )
      await this.executionRepo.saveStepExecution(stepExec.markFailed(errorMessage))
      // Let BullMQ apply the configured retry/backoff policy. The execution is
      // marked FAILED only after the final queue attempt is exhausted.
      throw error instanceof Error ? error : new Error(errorMessage)
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
