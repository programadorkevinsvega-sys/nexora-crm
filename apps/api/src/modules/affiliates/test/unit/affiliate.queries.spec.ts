import { GetProgramHandler, GetAffiliateHandler } from '../../application/queries/affiliate.handlers'
import { AffiliateProgram } from '../../domain/entities/affiliate-program.entity'
import { Affiliate } from '../../domain/entities/affiliate.entity'
import { NotFoundError } from '@crm/shared'
import { AffiliateProgramRepository } from '../../domain/repositories/affiliate-program.repository'
import { AffiliateRepository } from '../../domain/repositories/affiliate.repository'

describe('Affiliates Queries - Unit Tests', () => {
  let mockProgramRepo: jest.Mocked<Pick<AffiliateProgramRepository, 'findById'>>
  let mockAffiliateRepo: jest.Mocked<Pick<AffiliateRepository, 'findById'>>

  beforeEach(() => {
    mockProgramRepo = { findById: jest.fn() }
    mockAffiliateRepo = { findById: jest.fn() }
  })

  describe('GetProgramHandler', () => {
    it('should return affiliate program if found', async () => {
      const prog = AffiliateProgram.create({ tenantId: 'tenant-1', name: 'Partner', commissionType: 'FIXED', commissionValue: 50 })
      mockProgramRepo.findById.mockResolvedValue(prog)

      const handler = new GetProgramHandler(mockProgramRepo as unknown as AffiliateProgramRepository)
      const result = await handler.execute({ tenantId: 'tenant-1', id: prog.id })

      expect(result).toBe(prog)
    })

    it('should throw NotFoundError if program not found', async () => {
      mockProgramRepo.findById.mockResolvedValue(null)

      const handler = new GetProgramHandler(mockProgramRepo)
      await expect(handler.execute({ tenantId: 'tenant-1', id: 'missing' })).rejects.toThrow(NotFoundError)
    })
  })

  describe('GetAffiliateHandler', () => {
    it('should return registered affiliate', async () => {
      const aff = Affiliate.create({ tenantId: 'tenant-1', programId: 'p-1', customerId: 'c-1', referralCode: 'REF-1', referralLink: 'http' })
      mockAffiliateRepo.findById.mockResolvedValue(aff)

      const handler = new GetAffiliateHandler(mockAffiliateRepo as unknown as AffiliateRepository)
      const result = await handler.execute({ tenantId: 'tenant-1', id: aff.id })

      expect(result).toBe(aff)
    })
  })
})
