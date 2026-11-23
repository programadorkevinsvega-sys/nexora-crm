import { GetContractHandler } from '../../application/queries/contract.handlers'
import { Contract } from '../../domain/entities/contract.entity'
import { NotFoundError } from '@crm/shared'

describe('Contracts Queries - Unit Tests', () => {
  let mockRepo: any

  beforeEach(() => {
    mockRepo = { findById: jest.fn(), list: jest.fn() }
  })

  describe('GetContractHandler', () => {
    it('should return contract by id', async () => {
      const contract = Contract.create({ tenantId: 'tenant-1', companyId: 'c-1', name: 'SLA', startDate: '2026-01-01', ownerUserId: 'u-1' })
      mockRepo.findById.mockResolvedValue(contract)

      const handler = new GetContractHandler(mockRepo)
      const result = await handler.execute({ tenantId: 'tenant-1', id: contract.id })

      expect(result).toBe(contract)
    })

    it('should throw NotFoundError when contract does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null)

      const handler = new GetContractHandler(mockRepo)
      await expect(handler.execute({ tenantId: 'tenant-1', id: 'missing' })).rejects.toThrow(NotFoundError)
    })
  })
})
