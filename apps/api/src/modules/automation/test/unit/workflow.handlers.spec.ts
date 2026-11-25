import {
  CreateWorkflowHandler,
  ActivateWorkflowHandler,
  TriggerEventHandler,
} from '../../application/commands/workflow.handlers'
import {
  CreateWorkflowCommand,
  ActivateWorkflowCommand,
  TriggerEventCommand,
} from '../../application/commands/workflow.commands'
import { WorkflowDefinition } from '../../domain/entities/workflow-definition.entity'
import { WorkflowDefinitionRepository } from '../../domain/repositories/workflow-definition.repository'
import { WorkflowExecutionRepository } from '../../domain/repositories/workflow-execution.repository'
import { WorkflowEngineService } from '../../application/services/workflow-engine.service'
import { OutboxService } from '../../../../common/outbox/outbox.service'

describe('Workflow Command Handlers', () => {
  let defRepo: jest.Mocked<WorkflowDefinitionRepository>
  let execRepo: jest.Mocked<WorkflowExecutionRepository>
  let engine: jest.Mocked<WorkflowEngineService>
  let outbox: jest.Mocked<OutboxService>

  beforeEach(() => {
    defRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findActiveByTrigger: jest.fn(),
      list: jest.fn(),
      delete: jest.fn(),
    }

    execRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      scheduleDelay: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findRunningByEntity: jest.fn(),
      listExecutions: jest.fn(),
      getNextStepAttempt: jest.fn().mockResolvedValue(1),
      saveStepExecution: jest.fn().mockResolvedValue(undefined),
      findStepExecutionByIdempotencyKey: jest.fn(),
      listStepExecutions: jest.fn(),
    } as unknown as jest.Mocked<WorkflowExecutionRepository>

    engine = {
      processExecution: jest.fn().mockImplementation((exec) => Promise.resolve(exec)),
      resumeScheduledExecution: jest.fn(),
    } as unknown as jest.Mocked<WorkflowEngineService>

    outbox = { publish: jest.fn().mockResolvedValue(undefined) } as unknown as jest.Mocked<OutboxService>
  })

  it('CreateWorkflowHandler should persist a new workflow in DRAFT status', async () => {
    const handler = new CreateWorkflowHandler(defRepo)
    const result = await handler.execute(
      new CreateWorkflowCommand(
        'tenant-1',
        'Lead Onboarding',
        'crm.contact.created',
        [{ id: 's1', type: 'ACTION', action: 'SEND_WHATSAPP' }],
        'Sends WhatsApp to lead',
      ),
    )
    expect(result.id).toBeDefined()
    expect(defRepo.save).toHaveBeenCalledTimes(1)
  })

  it('ActivateWorkflowHandler should transition workflow to ACTIVE', async () => {
    const existing = WorkflowDefinition.create({
      tenantId: 'tenant-1',
      name: 'Test Flow',
      triggerEvent: 'crm.contact.created',
      stepsGraph: [{ id: 's1', type: 'ACTION' }],
    })
    defRepo.findById.mockResolvedValue(existing)
    const handler = new ActivateWorkflowHandler(defRepo)
    await handler.execute(new ActivateWorkflowCommand('tenant-1', existing.id))
    expect(defRepo.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'ACTIVE' }))
  })

  it('TriggerEventHandler should instantiate and process execution for matching active workflows', async () => {
    const activeWorkflow = WorkflowDefinition.create({
      tenantId: 'tenant-1',
      name: 'New Lead Flow',
      triggerEvent: 'crm.contact.created',
      stepsGraph: [{ id: 's1', type: 'ACTION', action: 'SEND_EMAIL' }],
    }).activate()
    defRepo.findActiveByTrigger.mockResolvedValue([activeWorkflow])

    const handler = new TriggerEventHandler(defRepo, execRepo, engine, outbox)
    const res = await handler.execute(
      new TriggerEventCommand(
        'tenant-1',
        'crm.contact.created',
        'contact',
        'contact-123',
        { name: 'Maria Gomez', leadStatus: 'NEW' },
      ),
    )

    expect(res.triggeredCount).toBe(1)
    expect(execRepo.save).toHaveBeenCalledTimes(1)
    expect(outbox.publish).toHaveBeenCalledTimes(1)
    expect(engine.processExecution).toHaveBeenCalledTimes(1)
  })
})
