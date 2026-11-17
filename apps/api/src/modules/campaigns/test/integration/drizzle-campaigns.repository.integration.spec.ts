import { DrizzleCampaignRepository } from '../../infrastructure/drizzle-campaign.repository'
import { Campaign } from '../../domain/entities/campaign.entity'
import * as dbModule from '@crm/database'

describe('DrizzleCampaignRepository - Persistence Integration Tests', () => {
  let repository: DrizzleCampaignRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      query: {
        campaigns: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
        campaignMembers: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
      },
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockResolvedValue(undefined),
        }),
      }),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    repository = new DrizzleCampaignRepository()
  })

  it('should find campaign and map budget and metrics', async () => {
    mockDb.query.campaigns.findFirst.mockResolvedValue({
      id: 'camp-1',
      tenantId: 'tenant-1',
      name: 'Black Friday 2026',
      type: 'EMAIL',
      status: 'ACTIVE',
      budgetedCost: 15000,
      actualCost: 4500,
      expectedRevenue: 100000,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const camp = await repository.findById('tenant-1', 'camp-1')

    expect(camp).not.toBeNull()
    expect(camp?.name).toBe('Black Friday 2026')
    expect(camp?.budgetedCost).toBe(15000)
  })

  it('should save campaign with conflict update', async () => {
    const camp = Campaign.create({
      tenantId: 'tenant-1',
      name: 'Summer Outreach',
      budgetedCost: 5000,
    })

    await repository.save(camp)

    expect(mockDb.insert).toHaveBeenCalled()
  })
})
