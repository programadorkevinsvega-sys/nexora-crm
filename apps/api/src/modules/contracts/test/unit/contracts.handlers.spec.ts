import { CreateContractHandler, RenewContractHandler } from '../../application/commands/contract.handlers'
import { Contract } from '../../domain/entities/contract.entity'

describe('Contracts Module - Unit Tests', () => {
  let mockRepo: any
  let mockOutbox: any

  beforeEach(() => {
    mockRepo = { save: jest.fn().mockResolvedValue(undefined), findById: jest.fn() }
    mockOutbox = { publish: jest.fn().mockResolvedValue(undefined) }
  })

  describe('CreateContractHandler', () => {
    it('should create and persist a customer contract with MRR value', async () => {
      const handler = new CreateContractHandler(mockRepo, mockOutbox)
      const result = await handler.execute({
        tenantId: 'tenant-1',
        companyId: 'company-1',
        dealId: undefined,
        name: 'Enterprise Annual License',
        startDate: '2026-01-01',
        endDate: '2027-01-01',
        autoRenew: true,
        mrrValue: 2500,
        ownerUserId: 'rep-1',
      })

      expect(result.id).toBeDefined()
      expect(mockRepo.save).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalledTimes(1)
    })
  })

  describe('RenewContractHandler', () => {
    it('should renew existing active contract and emit event', async () => {
      const contract = Contract.create({
        tenantId: 'tenant-1',
        companyId: 'c-1',
        name: 'SaaS Agreement',
        startDate: '2025-01-01',
        endDate: '2026-01-01',
        mrrValue: 1000,
        ownerUserId: 'user-1',
      }).updateStatus('ACTIVE')
      mockRepo.findById.mockResolvedValue(contract)

      const handler = new RenewContractHandler(mockRepo, mockOutbox)
      await handler.execute({
        tenantId: 'tenant-1',
        id: contract.id,
      })

      expect(mockRepo.save).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalled()
    })
  })
})
