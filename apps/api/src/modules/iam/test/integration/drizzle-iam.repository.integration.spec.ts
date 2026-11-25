import { DrizzleIamRepository } from '../../infrastructure/drizzle-iam.repository'
import { Role } from '../../domain/entities/role.entity'
import * as dbModule from '@crm/database'

describe('DrizzleIamRepository - Persistence Integration Tests', () => {
  let repository: DrizzleIamRepository
  let mockDb: {
    query: {
      roles: { findFirst: jest.Mock; findMany: jest.Mock }
      permissions: { findFirst: jest.Mock }
      userRoles: { findFirst: jest.Mock }
    }
    insert: jest.Mock
    transaction: jest.Mock
  }
  let mockTx: {
    query: { roles: { findFirst: jest.Mock } }
    execute: jest.Mock
    insert: jest.Mock
  }

  beforeEach(() => {
    const insert = jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        onConflictDoUpdate: jest.fn().mockResolvedValue(undefined),
      }),
    })
    mockTx = {
      query: {
        roles: {
          findFirst: jest.fn().mockResolvedValue(null),
        },
      },
      execute: jest.fn().mockResolvedValue(undefined),
      insert,
    }
    mockDb = {
      query: {
        roles: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
        permissions: {
          findFirst: jest.fn(),
        },
        userRoles: {
          findFirst: jest.fn(),
        },
      },
      insert,
      transaction: jest.fn(async (callback: (tx: typeof mockTx) => Promise<unknown>) => callback(mockTx)),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb as unknown as ReturnType<typeof dbModule.getDb>)
    repository = new DrizzleIamRepository()
  })

  it('should find role by tenantId and role name', async () => {
    mockDb.query.roles.findFirst.mockResolvedValue({
      id: 'role-admin',
      tenantId: 'tenant-1',
      name: 'SuperAdmin',
      description: 'Full permissions',
      isSystemRole: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const role = await repository.findRoleByName('tenant-1', 'SuperAdmin')

    expect(role).not.toBeNull()
    expect(role?.name).toBe('SuperAdmin')
  })

  it('should save role entity with conflict resolution', async () => {
    const role = Role.create({
      tenantId: 'tenant-1',
      name: 'Sales Manager',
      description: 'Manages sales pipelines',
    })

    await repository.saveRole(role)

    expect(mockDb.transaction).toHaveBeenCalledTimes(1)
    expect(mockTx.execute).toHaveBeenCalledTimes(1)
    expect(mockDb.insert).toHaveBeenCalled()
  })
})
