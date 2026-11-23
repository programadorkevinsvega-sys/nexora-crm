import { DrizzleWorkflowDefinitionRepository } from '../../infrastructure/drizzle-workflow-definition.repository'
import { DrizzleWorkflowExecutionRepository } from '../../infrastructure/drizzle-workflow-execution.repository'
import { WorkflowDefinition } from '../../domain/entities/workflow-definition.entity'
import { WorkflowExecution } from '../../domain/entities/workflow-execution.entity'
import * as dbModule from '@crm/database'

describe('Drizzle Automation Repositories - Persistence Integration Tests', () => {
  let defRepo: DrizzleWorkflowDefinitionRepository
  let execRepo: DrizzleWorkflowExecutionRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      transaction: jest.fn(async (callback: (tx: any) => Promise<unknown>) => callback(mockDb)),
      execute: jest.fn().mockResolvedValue([]),
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      }),
      delete: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    defRepo = new DrizzleWorkflowDefinitionRepository()
    execRepo = new DrizzleWorkflowExecutionRepository()
  })

  it('should save a new workflow definition via insert', async () => {
    mockDb.limit.mockResolvedValueOnce([]) // not found on findById check

    const def = WorkflowDefinition.create({
      tenantId: 'tenant-1',
      name: 'Onboarding Flow',
      triggerEvent: 'crm.contact.created',
      stepsGraph: [{ id: 's1', type: 'ACTION' }],
    })

    await defRepo.save(def)

    expect(mockDb.insert).toHaveBeenCalledTimes(1)
  })


  it('rejects changes to a persisted workflow definition version', async () => {
    const persisted = WorkflowDefinition.create({
      tenantId: 'tenant-1',
      name: 'Onboarding Flow',
      triggerEvent: 'crm.contact.created',
      stepsGraph: [{ id: 's1', type: 'ACTION', action: 'SEND_EMAIL' }],
    })
    mockDb.limit.mockResolvedValueOnce([{
      id: persisted.id,
      tenantId: persisted.tenantId,
      name: persisted.name,
      description: persisted.description,
      version: persisted.version,
      status: persisted.status,
      triggerEvent: persisted.triggerEvent,
      triggerFilter: persisted.triggerFilter,
      stepsGraph: persisted.stepsGraph,
      createdAt: persisted.createdAt,
      updatedAt: persisted.updatedAt,
    }])

    const modified = new WorkflowDefinition(
      persisted.id,
      persisted.tenantId,
      persisted.name,
      persisted.description,
      persisted.version,
      persisted.status,
      persisted.triggerEvent,
      persisted.triggerFilter,
      [{ id: 's1', type: 'ACTION', action: 'SEND_WHATSAPP' }],
      persisted.createdAt,
      new Date(),
    )

    await expect(defRepo.save(modified)).rejects.toThrow('Workflow versions are immutable')
    expect(mockDb.update).not.toHaveBeenCalled()
  })

  it('sets the tenant context within a transaction before querying workflow data', async () => {
    await defRepo.findById('tenant-1', 'workflow-1')

    expect(mockDb.transaction).toHaveBeenCalledTimes(1)
    expect(mockDb.execute).toHaveBeenCalledTimes(1)
  })

  it('does not permit physical deletion of a workflow version', async () => {
    await expect(defRepo.delete('tenant-1', 'workflow-1')).rejects.toThrow(
      'archive a version instead of deleting it',
    )
    expect(mockDb.delete).not.toHaveBeenCalled()
  })

  it('should save a workflow execution via insert', async () => {
    mockDb.limit.mockResolvedValueOnce([]) // not found on findById check

    const exec = WorkflowExecution.start({
      tenantId: 'tenant-1',
      workflowId: 'wf-1',
      version: 1,
      entityType: 'contact',
      entityId: 'c-1',
      initialStepId: 's1',
    })

    await execRepo.save(exec)

    expect(mockDb.insert).toHaveBeenCalledTimes(1)
  })
})
