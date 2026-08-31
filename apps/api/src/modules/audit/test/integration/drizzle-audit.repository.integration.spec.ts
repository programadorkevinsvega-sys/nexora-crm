import { DrizzleAuditRepository } from '../../infrastructure/drizzle-audit.repository'
import { AuditLog } from '../../domain/entities/audit.entity'
import * as dbModule from '@crm/database'

describe('DrizzleAuditRepository - Persistence Integration Tests', () => {
  let repository: DrizzleAuditRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      query: {
        auditLogs: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
      },
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoNothing: jest.fn().mockResolvedValue(undefined),
        }),
      }),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    repository = new DrizzleAuditRepository()
  })

  it('should find audit log by id with correlationId and user context', async () => {
    mockDb.query.auditLogs.findFirst.mockResolvedValue({
      id: 'audit-1',
      tenantId: 'tenant-1',
      entityType: 'Deal',
      entityId: 'deal-100',
      action: 'UPDATE',
      fieldName: 'status',
      oldValue: 'OPEN',
      newValue: 'WON',
      changedByUserId: 'user-1',
      moduleName: 'pipelines',
      correlationId: 'corr-uuid-1',
      createdAt: new Date(),
    })

    const log = await repository.findById('audit-1')

    expect(log).not.toBeNull()
    expect(log?.entityType).toBe('Deal')
    expect(log?.newValue).toBe('WON')
    expect(log?.correlationId).toBe('corr-uuid-1')
  })

  it('should insert immutable audit record using onConflictDoNothing', async () => {
    const log = AuditLog.create({
      tenantId: 'tenant-1',
      entityType: 'User',
      entityId: 'u-1',
      action: 'CREATE',
      changedByUserId: 'admin-1',
      moduleName: 'users',
    })

    await repository.save(log)

    expect(mockDb.insert).toHaveBeenCalled()
  })
})
