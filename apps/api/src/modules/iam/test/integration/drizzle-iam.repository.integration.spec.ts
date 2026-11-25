import { DrizzleIamRepository } from '../../infrastructure/drizzle-iam.repository'
import { Role } from '../../domain/entities/role.entity'
import * as dbModule from '@crm/database'

type AsyncMock = jest.MockedFunction<(...args: unknown[]) => Promise<unknown>>
type SyncMock = jest.MockedFunction<(...args: unknown[]) => unknown>

type MockTransaction = {
  query: { roles: { findFirst: AsyncMock } }
  execute: AsyncMock
  insert: SyncMock
}

type MockDatabase = {
  query: {
    roles: { findFirst: AsyncMock; findMany: AsyncMock }
    permissions: { findFirst: AsyncMock }
    userRoles: { findFirst: AsyncMock }
  }
  insert: SyncMock
  transaction: jest.MockedFunction<(callback: (tx: MockTransaction) => Promise<unknown>) => Promise<unknown>>
}

describe('DrizzleIamRepository - Persistence Integration Tests', () => {
  let repository: DrizzleIamRepository
  let mockDb: MockDatabase
  let mockTx: MockTransaction

  beforeEach(() => {
    const insert = jest.fn<unknown, unknown[]>().mockReturnValue({
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
      transaction: jest.fn<Promise<unknown>, [(tx: MockTransaction) => Promise<unknown>]>().mockImplementation(async (callback) => callback(mockTx)),
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
