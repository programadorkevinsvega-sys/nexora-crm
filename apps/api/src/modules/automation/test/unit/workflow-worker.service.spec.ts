import { WorkflowDefinition } from '../../domain/entities/workflow-definition.entity'
import { WorkflowExecution } from '../../domain/entities/workflow-execution.entity'
import { WorkflowExecutionRepository } from '../../domain/repositories/workflow-execution.repository'
import { WorkflowDefinitionRepository } from '../../domain/repositories/workflow-definition.repository'
import { WorkflowEngineService } from '../../application/services/workflow-engine.service'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { WorkflowQueueJobData, WorkflowQueueService } from '../../infrastructure/workflow-queue.service'
import { WorkflowWorkerService } from '../../infrastructure/workflow-worker.service'

describe('WorkflowWorkerService', () => {
  let executionRepo: jest.Mocked<WorkflowExecutionRepository>
  let definitionRepo: jest.Mocked<WorkflowDefinitionRepository>
  let engine: jest.Mocked<WorkflowEngineService>
  let queue: jest.Mocked<WorkflowQueueService>
  let outbox: jest.Mocked<OutboxService>
  let service: WorkflowWorkerService
  let definition: WorkflowDefinition
  let execution: WorkflowExecution

  const processJob = (data: WorkflowQueueJobData) => ({
    data,
    attemptsMade: 0,
    opts: { attempts: 3 },
    id: 'job-1',
    name: 'workflow-job',
    failedReason: null,
    remove: jest.fn().mockResolvedValue(undefined),
  })

  const callProcess = (job: ReturnType<typeof processJob>) =>
    (service as unknown as {
      process: (value: ReturnType<typeof processJob>) => Promise<Record<string, unknown>>
    }).process(job)

  beforeEach(() => {
    definition = WorkflowDefinition.create({
      tenantId: '00000000-0000-0000-0000-000000000001',
      name: 'Worker test',
      triggerEvent: 'crm.contact.created',
      stepsGraph: [
        { id: 'wait', type: 'DELAY', duration: '10m', nextStepId: 'next' },
        { id: 'next', type: 'ACTION', action: 'NOOP' },
      ],
    })
    execution = WorkflowExecution.start({
      tenantId: definition.tenantId,
      workflowId: definition.id,
      version: definition.version,
      entityType: 'CONTACT',
      entityId: '00000000-0000-0000-0000-000000000002',
      initialStepId: 'wait',
    })

    executionRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue(execution),
      findRunningByEntity: jest.fn(),
      listExecutions: jest.fn(),
      saveStepExecution: jest.fn(),
      findStepExecutionByIdempotencyKey: jest.fn(),
      listStepExecutions: jest.fn(),
    }
    definitionRepo = {
      save: jest.fn(),
      findById: jest.fn().mockResolvedValue(definition),
      findActiveByTrigger: jest.fn(),
      list: jest.fn(),
      delete: jest.fn(),
    }
    engine = {
      processExecution: jest.fn().mockResolvedValue(execution),
      resumeAfterDelay: jest.fn().mockResolvedValue(execution),
    } as any
    queue = {
      waitUntilReady: jest.fn().mockResolvedValue(undefined),
      scheduleDelay: jest.fn().mockResolvedValue(undefined),
      getQueuePrefix: jest.fn().mockReturnValue('nexora-crm'),
      getConcurrency: jest.fn().mockReturnValue(5),
    } as any
    outbox = { publish: jest.fn().mockResolvedValue(undefined) } as any
    service = new WorkflowWorkerService(executionRepo, definitionRepo, engine, queue, outbox)
  })

  it('recovers an execution persisted as WAITING_DELAY when the producer was interrupted', async () => {
    const resumeAt = new Date(Date.now() + 60_000)
    executionRepo.findById.mockResolvedValue(execution.waitForDelay('wait', resumeAt))

    const result = await callProcess(processJob({
      kind: 'PROCESS_EXECUTION',
      tenantId: execution.tenantId,
      executionId: execution.id,
    }))

    expect(result).toEqual({ status: 'WAITING_DELAY', recovered: true })
    expect(queue.scheduleDelay).toHaveBeenCalledWith(
      expect.objectContaining({ resumeAt }),
      expect.objectContaining({ id: 'wait' }),
      resumeAt,
    )
  })

  it('ignores stale delay jobs after a later schedule replaced their due time', async () => {
    const currentResumeAt = new Date(Date.now() + 120_000)
    executionRepo.findById.mockResolvedValue(execution.waitForDelay('wait', currentResumeAt))

    const result = await callProcess(processJob({
      kind: 'RESUME_DELAY',
      tenantId: execution.tenantId,
      executionId: execution.id,
      workflowId: definition.id,
      workflowVersion: definition.version,
      stepId: 'wait',
      resumeAt: new Date(currentResumeAt.getTime() - 60_000).toISOString(),
    }))

    expect(result).toMatchObject({ skipped: true, reason: 'stale-delay-job' })
    expect(engine.resumeAfterDelay).not.toHaveBeenCalled()
  })

  it('resumes only the exact immutable workflow version and delay step', async () => {
    const resumeAt = new Date(Date.now() + 60_000)
    executionRepo.findById.mockResolvedValue(execution.waitForDelay('wait', resumeAt))

    const result = await callProcess(processJob({
      kind: 'RESUME_DELAY',
      tenantId: execution.tenantId,
      executionId: execution.id,
      workflowId: definition.id,
      workflowVersion: definition.version,
      stepId: 'wait',
      resumeAt: resumeAt.toISOString(),
    }))

    expect(result).toEqual({ status: 'RUNNING' })
    expect(engine.resumeAfterDelay).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'WAITING_DELAY' }),
      definition,
      definition.stepsGraph[0],
    )
  })
})
