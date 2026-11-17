import { GetProfileHandler, GetSegmentsHandler } from '../../application/queries/loyalty.handlers'
import { LoyaltyProfile } from '../../domain/entities/loyalty-profile.entity'
import { CustomerSegment } from '../../domain/entities/customer-segment.entity'
import { NotFoundError } from '@crm/shared'

describe('Loyalty Queries - Unit Tests', () => {
  let mockLoyaltyRepo: any
  let mockSegmentRepo: any

  beforeEach(() => {
    mockLoyaltyRepo = { findProfileByContactId: jest.fn() }
    mockSegmentRepo = { list: jest.fn() }
  })

  describe('GetProfileHandler', () => {
    it('should return loyalty profile by contact id', async () => {
      const profile = LoyaltyProfile.create({ tenantId: 'tenant-1', contactId: 'c-1' })
      mockLoyaltyRepo.findProfileByContactId.mockResolvedValue(profile)

      const handler = new GetProfileHandler(mockLoyaltyRepo)
      const result = await handler.execute({ tenantId: 'tenant-1', contactId: 'c-1' })

      expect(result).toBe(profile)
    })

    it('should throw NotFoundError if profile missing', async () => {
      mockLoyaltyRepo.findProfileByContactId.mockResolvedValue(null)

      const handler = new GetProfileHandler(mockLoyaltyRepo)
      await expect(handler.execute({ tenantId: 'tenant-1', contactId: 'missing' })).rejects.toThrow(NotFoundError)
    })
  })

  describe('GetSegmentsHandler', () => {
    it('should return customer segments', async () => {
      const segments = [CustomerSegment.create({ tenantId: 'tenant-1', name: 'VIP' })]
      mockSegmentRepo.list.mockResolvedValue(segments)

      const handler = new GetSegmentsHandler(mockSegmentRepo)
      const result = await handler.execute({ tenantId: 'tenant-1' })

      expect(result).toEqual(segments)
    })
  })
})
