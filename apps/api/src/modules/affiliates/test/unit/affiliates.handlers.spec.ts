import { CreateProgramHandler, RegisterAffiliateHandler } from '../../application/commands/affiliate.handlers'

describe('Affiliates Module - Unit Tests', () => {
  let mockProgramRepo: any
  let mockAffiliateRepo: any
  let mockOutbox: any

  beforeEach(() => {
    mockProgramRepo = { save: jest.fn().mockResolvedValue(undefined), findById: jest.fn() }
    mockAffiliateRepo = { save: jest.fn().mockResolvedValue(undefined) }
    mockOutbox = { publish: jest.fn().mockResolvedValue(undefined) }
  })

  describe('CreateProgramHandler', () => {
    it('should create an affiliate partner program', async () => {
      const handler = new CreateProgramHandler(mockProgramRepo, mockOutbox)
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
      const handler = new RegisterAffiliateHandler(mockAffiliateRepo, mockOutbox)
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
