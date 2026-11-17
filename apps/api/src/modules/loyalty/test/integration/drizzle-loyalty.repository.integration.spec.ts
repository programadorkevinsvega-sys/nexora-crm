import { DrizzleLoyaltyRepository } from '../../infrastructure/drizzle-loyalty.repository'
import { LoyaltyProfile } from '../../domain/entities/loyalty-profile.entity'
import * as dbModule from '@crm/database'

describe('DrizzleLoyaltyRepository - Persistence Integration Tests', () => {
  let repository: DrizzleLoyaltyRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      query: {
        loyaltyProfiles: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
      },
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockResolvedValue(undefined),
        }),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      }),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    repository = new DrizzleLoyaltyRepository()
  })

  it('should find loyalty profile by contact id and map tier progress', async () => {
    mockDb.query.loyaltyProfiles.findFirst.mockResolvedValue({
      id: 'lp-1',
      tenantId: 'tenant-1',
      contactId: 'c-100',
      loyaltyPointsBalance: 1250,
      tierLevel: 'GOLD',
      totalLifetimeValue: 8500,
      totalPurchasesCount: 15,
      averageOrderValue: 566.66,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const profile = await repository.findProfileByContactId('tenant-1', 'c-100')

    expect(profile).not.toBeNull()
    expect(profile?.tierLevel).toBe('GOLD')
    expect(profile?.loyaltyPointsBalance).toBe(1250)
  })

  it('should update points balance and execute database update', async () => {
    const profile = LoyaltyProfile.create({
      tenantId: 'tenant-1',
      contactId: 'c-100',
    })

    await repository.updatePoints(profile)

    expect(mockDb.update).toHaveBeenCalled()
  })
})
