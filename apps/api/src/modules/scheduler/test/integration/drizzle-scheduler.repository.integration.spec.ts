import { DrizzleSchedulerRepository } from '../../infrastructure/drizzle-scheduler.repository'
import { ScheduledTask } from '../../domain/entities/scheduler.entity'
import * as dbModule from '@crm/database'

describe('DrizzleSchedulerRepository - Persistence Integration Tests', () => {
  let repository: DrizzleSchedulerRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      query: {
        scheduledTasks: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
      },
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoNothing: jest.fn().mockResolvedValue(undefined),
        }),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      }),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    repository = new DrizzleSchedulerRepository()
  })

  it('should find scheduled task by id with cron schedule configuration', async () => {
    mockDb.query.scheduledTasks.findFirst.mockResolvedValue({
      id: 'task-sync',
      tenantId: 'tenant-1',
      name: 'Sync ERP Customers',
      cronExpression: '0 0 * * *',
      taskType: 'CRON',
      targetService: 'sync-engine',
      targetEndpoint: '/api/v1/sync',
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const task = await repository.findTaskById('task-sync')

    expect(task).not.toBeNull()
    expect(task?.name).toBe('Sync ERP Customers')
    expect(task?.cronExpression).toBe('0 0 * * *')
    expect(task?.enabled).toBe(true)
  })

  it('should query due scheduled tasks for execution', async () => {
    mockDb.query.scheduledTasks.findMany.mockResolvedValue([
      {
        id: 'task-sync',
        tenantId: 'tenant-1',
        name: 'Sync ERP Customers',
        cronExpression: '0 0 * * *',
        enabled: true,
        nextRunAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const dueTasks = await repository.findDueTasks()

    expect(dueTasks.length).toBe(1)
    expect(dueTasks[0].id).toBe('task-sync')
  })
})
