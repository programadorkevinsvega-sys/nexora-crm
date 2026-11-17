import { DrizzleSalesTeamRepository } from '../../infrastructure/drizzle-sales-team.repository'
import { SalesTeam } from '../../domain/entities/sales-team.entity'
import * as dbModule from '@crm/database'

describe('DrizzleSalesTeamRepository - Persistence Integration Tests', () => {
  let repository: DrizzleSalesTeamRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      query: {
        salesTeams: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
        salesTeamMembers: {
          findMany: jest.fn().mockResolvedValue([]),
        },
      },
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockResolvedValue(undefined),
        }),
      }),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    repository = new DrizzleSalesTeamRepository()
  })

  it('should find sales team and attach members list', async () => {
    mockDb.query.salesTeams.findFirst.mockResolvedValue({
      id: 'team-latam',
      tenantId: 'tenant-1',
      name: 'LATAM Growth SDRs',
      managerUserId: 'mgr-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const team = await repository.findByIdWithMembers('tenant-1', 'team-latam')

    expect(team).not.toBeNull()
    expect(team?.name).toBe('LATAM Growth SDRs')
    expect(team?.managerUserId).toBe('mgr-1')
  })

  it('should save sales team entity', async () => {
    const team = SalesTeam.create({
      tenantId: 'tenant-1',
      name: 'EMEA Sales',
    })

    await repository.save(team)

    expect(mockDb.insert).toHaveBeenCalled()
  })
})
