import { DrizzleIamRepository } from '../../infrastructure/drizzle-iam.repository'
import { Role } from '../../domain/entities/role.entity'
import * as dbModule from '@crm/database'

describe('DrizzleIamRepository - Persistence Integration Tests', () => {
  let repository: DrizzleIamRepository
  let mockDb: any

  beforeEach(() => {
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
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockResolvedValue(undefined),
        }),
      }),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    repository = new DrizzleIamRepository()
  })

  it('should find role by tenantId and role name', async () => {
    mockDb.query.roles.findFirst.mockResolvedValue({
      id: 'role-admin',
      tenantId: 'tenant-1',
      name: 'SuperAdmin',
      description: 'Full permissions',
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

    expect(mockDb.insert).toHaveBeenCalled()
  })
})
