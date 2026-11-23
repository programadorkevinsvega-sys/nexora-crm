import { Injectable, Logger } from '@nestjs/common'
import { WorkflowDefinition } from '../../domain/entities/workflow-definition.entity'
import { WorkflowExecution } from '../../domain/entities/workflow-execution.entity'
import { WorkflowStepExecution } from '../../domain/entities/workflow-step-execution.entity'
import { WorkflowStep } from '@crm/contracts'
import { ConditionEvaluator } from '../../domain/services/condition-evaluator.service'
import { calculateWorkflowResumeAt } from '../../domain/services/workflow-delay.parser'
import { WorkflowExecutionRepository, WorkflowDelayScheduleMessage } from '../../domain/repositories/workflow-execution.repository'
import { WorkflowDefinitionRepository } from '../../domain/repositories/workflow-definition.repository'
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
    private readonly definitionRepo: WorkflowDefinitionRepository,
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

  async resumeScheduledExecution(message: WorkflowDelayScheduleMessage): Promise<WorkflowExecution | null> {
    const execution = await this.executionRepo.findById(message.tenantId, message.executionId)
    if (
      !execution ||
      execution.resumeToken !== message.resumeToken ||
      execution.workflowId !== message.workflowId ||
      execution.version !== message.workflowVersion
    ) return null

    const definition = await this.definitionRepo.findById(message.tenantId, execution.workflowId)
    if (!definition || definition.version !== execution.version) {
      throw new Error('Pinned workflow definition version is unavailable')
    }

    const delayStep = definition.stepsGraph.find((step) => step.id === message.stepId)
    if (
      !delayStep ||
      delayStep.type !== 'DELAY' ||
      (delayStep.nextStepId ?? null) !== message.nextStepId
    ) {
      throw new Error('Scheduled delay does not match the pinned workflow definition')
    }

    let ready: WorkflowExecution
    if (execution.status === 'WAITING_DELAY') {
      if (execution.currentStepId !== message.stepId) return null
      if (!execution.resumeAt) throw new Error('Waiting workflow execution has no persisted resumeAt')
      const messageResumeAt = new Date(message.resumeAt).getTime()
      if (
        Number.isNaN(messageResumeAt) ||
        execution.resumeAt.getTime() !== messageResumeAt
      ) {
        return null
      }
      if (execution.resumeAt.getTime() > Date.now()) {
        throw new Error('JetStream delivered a workflow delay before its persisted resumeAt')
      }

      if (!message.nextStepId) {
        const completed = execution.complete()
        await this.executionRepo.save(completed)
        await this.outbox.publish(new WorkflowExecutionCompletedEvent(completed.id, definition.id))
        return completed
      }

      ready = execution.resumeFromDelay(message.nextStepId)
      await this.executionRepo.save(ready)
    } else if (execution.status === 'FAILED') {
      ready = execution.retry()
      await this.executionRepo.save(ready)
    } else if (execution.status === 'RUNNING' && !execution.resumeAt) {
      // The same durable delivery may be redelivered after a worker restart.
      // The resume token and pinned definition constrain it to the same wait.
      ready = execution
    } else {
      return null
    }

    return this.processExecution(ready, definition)
  }

  private async executeStep(
    execution: WorkflowExecution,
    definition: WorkflowDefinition,
    step: WorkflowStep,
  ): Promise<WorkflowExecution> {
    const attempt = await this.executionRepo.getNextStepAttempt(
      execution.tenantId,
      execution.id,
      step.id,
    )
    const stepExec = WorkflowStepExecution.create({
      tenantId: execution.tenantId,
      executionId: execution.id,
      stepId: step.id,
      attempt,
    })
    await this.executionRepo.saveStepExecution(stepExec.markExecuting())

    try {
      if (step.type === 'DELAY') {
        const resumeAt = calculateWorkflowResumeAt(step.duration)
        const waitingExec = execution.waitForDelay(step.id, resumeAt)
        const completedStep = stepExec.markSuccess({
          delayedDuration: step.duration ?? '1h',
          resumeAt: resumeAt.toISOString(),
        })
        const message: WorkflowDelayScheduleMessage = {
          tenantId: execution.tenantId,
          executionId: execution.id,
          workflowId: definition.id,
          workflowVersion: definition.version,
          stepId: step.id,
          nextStepId: step.nextStepId ?? null,
          resumeAt: resumeAt.toISOString(),
          resumeToken: waitingExec.resumeToken!,
        }
        await this.executionRepo.scheduleDelay(waitingExec, completedStep, message)
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
