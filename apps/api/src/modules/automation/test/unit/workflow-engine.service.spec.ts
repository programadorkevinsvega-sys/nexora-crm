import { WorkflowDefinition } from '../../domain/entities/workflow-definition.entity'
import { WorkflowExecution } from '../../domain/entities/workflow-execution.entity'
import { WorkflowStepExecution } from '../../domain/entities/workflow-step-execution.entity'
import { WorkflowExecutionRepository } from '../../domain/repositories/workflow-execution.repository'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { WorkflowQueueService } from '../../infrastructure/workflow-queue.service'
import { WorkflowEngineService } from '../../application/services/workflow-engine.service'

describe('WorkflowEngineService delayed execution', () => {
  let repository: jest.Mocked<WorkflowExecutionRepository>
  let outbox: jest.Mocked<OutboxService>
  let queue: jest.Mocked<WorkflowQueueService>
  let engine: WorkflowEngineService

  beforeEach(() => {
    repository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findRunningByEntity: jest.fn(),
      listExecutions: jest.fn(),
      saveStepExecution: jest.fn().mockResolvedValue(undefined),
      findStepExecutionByIdempotencyKey: jest.fn(),
      listStepExecutions: jest.fn().mockResolvedValue([]),
    }
    outbox = { publish: jest.fn().mockResolvedValue(undefined) } as any
    queue = { scheduleDelay: jest.fn().mockResolvedValue(undefined) } as any
    engine = new WorkflowEngineService(repository, outbox, queue)
  })

  it.each(['10m', '24h', '30d'])('persists and enqueues a %s delay', async (duration) => {
    const definition = WorkflowDefinition.create({
      tenantId: '00000000-0000-0000-0000-000000000001',
      name: 'Delayed workflow',
      triggerEvent: 'crm.contact.created',
      stepsGraph: [{ id: 'wait', type: 'DELAY', duration, nextStepId: 'finish' }],
    })
    const execution = WorkflowExecution.start({
      tenantId: definition.tenantId,
      workflowId: definition.id,
      version: definition.version,
      entityType: 'CONTACT',
      entityId: '00000000-0000-0000-0000-000000000002',
      initialStepId: 'wait',
    })

    const result = await engine.processExecution(execution, definition)

    expect(result.status).toBe('WAITING_DELAY')
    expect(result.resumeAt).toBeInstanceOf(Date)
    expect(result.resumeAt!.getTime()).toBeGreaterThan(Date.now())
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'WAITING_DELAY', currentStepId: 'wait' }),
    )
    expect(queue.scheduleDelay).toHaveBeenCalledWith(
      expect.objectContaining({ id: execution.id, status: 'WAITING_DELAY' }),
      expect.objectContaining({ id: 'wait', duration }),
      result.resumeAt,
    )
  })

  it('resumes from the pinned delay step and completes when there is no next step', async () => {
    const definition = WorkflowDefinition.create({
      tenantId: '00000000-0000-0000-0000-000000000001',
      name: 'Terminal delay',
      triggerEvent: 'crm.contact.created',
      stepsGraph: [{ id: 'wait', type: 'DELAY', duration: '10m' }],
    })
    const waiting = WorkflowExecution.start({
      tenantId: definition.tenantId,
      workflowId: definition.id,
      version: definition.version,
      entityType: 'CONTACT',
      entityId: '00000000-0000-0000-0000-000000000002',
      initialStepId: 'wait',
    }).waitForDelay('wait', new Date(Date.now() + 60_000))
    const stepExecution = WorkflowStepExecution.create({
      tenantId: definition.tenantId,
      executionId: waiting.id,
      stepId: 'wait',
    }).markExecuting()
    repository.listStepExecutions.mockResolvedValue([stepExecution])

    const result = await engine.resumeAfterDelay(waiting, definition, definition.stepsGraph[0])

    expect(result.status).toBe('COMPLETED')
    expect(repository.saveStepExecution).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'SUCCESS', stepId: 'wait' }),
    )
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'COMPLETED' }))
    expect(outbox.publish).toHaveBeenCalledTimes(1)
  })

  it('throws step failures so BullMQ can retry instead of prematurely failing the execution', async () => {
    const definition = WorkflowDefinition.create({
      tenantId: '00000000-0000-0000-0000-000000000001',
      name: 'Retryable workflow',
      triggerEvent: 'crm.contact.created',
      stepsGraph: [{ id: 'action', type: 'ACTION', action: 'TEST' }],
    })
    const execution = WorkflowExecution.start({
      tenantId: definition.tenantId,
      workflowId: definition.id,
      version: definition.version,
      entityType: 'CONTACT',
      entityId: '00000000-0000-0000-0000-000000000002',
      initialStepId: 'action',
    })
    jest.spyOn(engine as any, 'performAction').mockRejectedValue(new Error('temporary failure'))

    await expect(engine.processExecution(execution, definition)).rejects.toThrow('temporary failure')

    expect(repository.saveStepExecution).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'FAILED', errorMessage: 'temporary failure' }),
    )
    expect(repository.save).not.toHaveBeenCalledWith(expect.objectContaining({ status: 'FAILED' }))
  })
})
