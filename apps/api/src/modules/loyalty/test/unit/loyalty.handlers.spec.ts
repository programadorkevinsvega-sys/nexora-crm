import { EarnPointsHandler, RedeemPointsHandler } from '../../application/commands/loyalty.handlers'
import { LoyaltyProfile } from '../../domain/entities/loyalty-profile.entity'

describe('Loyalty Module - Unit Tests', () => {
  let mockRepo: any
  let mockOutbox: any

  beforeEach(() => {
    mockRepo = { updatePoints: jest.fn().mockResolvedValue(undefined), findProfileByContactId: jest.fn() }
    mockOutbox = { publish: jest.fn().mockResolvedValue(undefined) }
  })

  describe('EarnPointsHandler', () => {
    it('should award loyalty points and upgrade tier when threshold met', async () => {
      const profile = LoyaltyProfile.create({ tenantId: 'tenant-1', contactId: 'contact-1' })
      mockRepo.findProfileByContactId.mockResolvedValue(profile)

      const handler = new EarnPointsHandler(mockRepo, mockOutbox)
      const result = await handler.execute({ tenantId: 'tenant-1', contactId: 'contact-1', points: 1500 })

      expect(result.newBalance).toBe(1500)
      expect(mockRepo.updatePoints).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalled()
    })
  })

  describe('RedeemPointsHandler', () => {
    it('should deduct points upon redemption', async () => {
      const profile = LoyaltyProfile.create({ tenantId: 'tenant-1', contactId: 'contact-1' }).earnPoints(500)
      mockRepo.findProfileByContactId.mockResolvedValue(profile)

      const handler = new RedeemPointsHandler(mockRepo, mockOutbox)
      const result = await handler.execute({ tenantId: 'tenant-1', contactId: 'contact-1', points: 200 })

      expect(result.newBalance).toBe(300)
      expect(mockRepo.updatePoints).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalled()
    })
  })
})
