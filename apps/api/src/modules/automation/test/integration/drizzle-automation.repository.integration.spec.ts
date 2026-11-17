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
