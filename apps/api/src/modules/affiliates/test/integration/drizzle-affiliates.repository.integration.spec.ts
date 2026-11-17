import { DrizzleAffiliateRepository } from '../../infrastructure/drizzle-affiliate.repository'
import { Affiliate } from '../../domain/entities/affiliate.entity'
import * as dbModule from '@crm/database'

describe('DrizzleAffiliateRepository - Persistence Integration Tests', () => {
  let repository: DrizzleAffiliateRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      query: {
        affiliates: {
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
    repository = new DrizzleAffiliateRepository()
  })

  it('should find affiliate by referral code', async () => {
    mockDb.query.affiliates.findFirst.mockResolvedValue({
      id: 'aff-1',
      tenantId: 'tenant-1',
      programId: 'prog-1',
      customerId: 'cust-1',
      referralCode: 'DEV2026',
      referralLink: 'https://app.crm.com/ref/DEV2026',
      parentAffiliateId: null,
      mlmLevel: 1,
      status: 'ACTIVE',
      totalEarnings: 2500,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const aff = await repository.findByReferralCode('tenant-1', 'DEV2026')

    expect(aff).not.toBeNull()
    expect(aff?.referralCode).toBe('DEV2026')
    expect(aff?.totalEarnings).toBe(2500)
  })

  it('should save affiliate entity', async () => {
    const aff = Affiliate.create({
      tenantId: 'tenant-1',
      programId: 'prog-1',
      customerId: 'cust-1',
      referralCode: 'PARTNER50',
      referralLink: 'http://ref.link',
    })

    await repository.save(aff)

    expect(mockDb.insert).toHaveBeenCalled()
  })
})
