import { DrizzleUserRepository } from '../../infrastructure/drizzle-user.repository'
import * as dbModule from '@crm/database'

describe('DrizzleUserRepository - Persistence Integration Tests', () => {
  let repository: DrizzleUserRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      query: {
        users: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
        naturalPersonProfiles: {
          findFirst: jest.fn().mockResolvedValue({
            id: 'np-1',
            firstName: 'Peter',
            lastName: 'Parker',
          }),
        },
        legalEntityProfiles: {
          findFirst: jest.fn(),
        },
      },
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockResolvedValue(undefined),
        }),
      }),
      delete: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    repository = new DrizzleUserRepository()
  })

  it('should find user by email and attach natural person profile', async () => {
    mockDb.query.users.findFirst.mockResolvedValue({
      id: 'u-10',
      tenantId: 'tenant-1',
      email: 'peter@dailybugle.test',
      passwordHash: 'hashed_pw',
      profileType: 'NATURAL_PERSON',
      profileId: 'np-1',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const user = await repository.findByEmail('tenant-1', 'peter@dailybugle.test')

    expect(user).not.toBeNull()
    expect(user?.email).toBe('peter@dailybugle.test')
    expect(mockDb.query.naturalPersonProfiles.findFirst).toHaveBeenCalled()
  })

  it('should list users with cursor pagination and status filter', async () => {
    mockDb.query.users.findMany.mockResolvedValue([
      {
        id: 'u-1',
        tenantId: 'tenant-1',
        email: 'user1@example.com',
        status: 'ACTIVE',
        profileType: 'NATURAL_PERSON',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const result = await repository.list('tenant-1', { limit: 10, status: 'ACTIVE' as any })

    expect(result.data.length).toBe(1)
    expect(result.data[0].email).toBe('user1@example.com')
  })
})
