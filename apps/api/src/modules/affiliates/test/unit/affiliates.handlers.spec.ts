import { CreateProgramHandler, RegisterAffiliateHandler } from '../../application/commands/affiliate.handlers'
import { AffiliateProgramRepository } from '../../domain/repositories/affiliate-program.repository'
import { AffiliateRepository } from '../../domain/repositories/affiliate.repository'
import { OutboxService } from '../../../../common/outbox/outbox.service'

describe('Affiliates Module - Unit Tests', () => {
  let mockProgramRepo: jest.Mocked<Pick<AffiliateProgramRepository, 'save' | 'findById'>>
  let mockAffiliateRepo: jest.Mocked<Pick<AffiliateRepository, 'save'>>
  let mockOutbox: jest.Mocked<Pick<OutboxService, 'publish'>>

  beforeEach(() => {
    mockProgramRepo = {
      save: jest.fn<ReturnType<AffiliateProgramRepository['save']>, Parameters<AffiliateProgramRepository['save']>>().mockResolvedValue(undefined),
      findById: jest.fn<ReturnType<AffiliateProgramRepository['findById']>, Parameters<AffiliateProgramRepository['findById']>>(),
    }
    mockAffiliateRepo = {
      save: jest.fn<ReturnType<AffiliateRepository['save']>, Parameters<AffiliateRepository['save']>>().mockResolvedValue(undefined),
    }
    mockOutbox = {
      publish: jest.fn<ReturnType<OutboxService['publish']>, Parameters<OutboxService['publish']>>().mockResolvedValue(undefined),
    }
  })

  describe('CreateProgramHandler', () => {
    it('should create an affiliate partner program', async () => {
      const handler = new CreateProgramHandler(mockProgramRepo as unknown as AffiliateProgramRepository, mockOutbox as unknown as OutboxService)
      const result = await handler.execute({
        tenantId: 'tenant-1',
        name: 'Influencer 20% RevShare',
        commissionType: 'PERCENTAGE',
        commissionValue: 20,
        cookieDurationDays: 30,
        isActive: true,
      })

      expect(result.id).toBeDefined()
      expect(mockProgramRepo.save).toHaveBeenCalled()
    })
  })

  describe('RegisterAffiliateHandler', () => {
    it('should register an affiliate with unique referral code', async () => {
      const handler = new RegisterAffiliateHandler(mockAffiliateRepo as unknown as AffiliateRepository, mockOutbox as unknown as OutboxService)
      const result = await handler.execute({
        tenantId: 'tenant-1',
        programId: 'prog-1',
        customerId: 'customer-1',
        referralCode: 'REF-ACME-2026',
        referralLink: 'https://crm.example.com/ref/REF-ACME-2026',
      })

      expect(result.id).toBeDefined()
      expect(mockAffiliateRepo.save).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalledTimes(1)
    })
  })
})
