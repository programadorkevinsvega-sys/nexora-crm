import { LoyaltyProfile } from '../../domain/entities/loyalty-profile.entity'
import { CustomerSegment } from '../../domain/entities/customer-segment.entity'

describe('Loyalty & Segmentation Domain Entities', () => {
  describe('LoyaltyProfile Entity', () => {
    it('should initialize with BRONZE tier and 0 points balance', () => {
      const profile = LoyaltyProfile.create({
        tenantId: 'tenant-1',
        contactId: 'contact-1',
      })

      expect(profile.tierLevel).toBe('BRONZE')
      expect(profile.loyaltyPointsBalance).toBe(0)
    })

    it('should upgrade tier automatically based on points earned', () => {
      const profile = LoyaltyProfile.create({
        tenantId: 'tenant-1',
        contactId: 'contact-1',
      })

      const silverProfile = profile.earnPoints(1500)
      expect(silverProfile.loyaltyPointsBalance).toBe(1500)
      expect(silverProfile.tierLevel).toBe('SILVER')

      const goldProfile = silverProfile.earnPoints(4000)
      expect(goldProfile.loyaltyPointsBalance).toBe(5500)
      expect(goldProfile.tierLevel).toBe('GOLD')

      const platinumProfile = goldProfile.earnPoints(5000)
      expect(platinumProfile.loyaltyPointsBalance).toBe(10500)
      expect(platinumProfile.tierLevel).toBe('PLATINUM')
    })

    it('should deduct points upon redemption without negative balance', () => {
      const profile = LoyaltyProfile.create({ tenantId: 'tenant-1', contactId: 'c-1' }).earnPoints(500)
      const redeemed = profile.redeemPoints(200)

      expect(redeemed.loyaltyPointsBalance).toBe(300)
    })
  })

  describe('CustomerSegment Entity', () => {
    it('should create dynamic customer segment with criteria rules', () => {
      const segment = CustomerSegment.create({
        tenantId: 'tenant-1',
        name: 'High-Value VIPs',
        description: 'Customers with LTV > $10,000',
        rulesJson: { minLtv: 10000 },
      })

      expect(segment.name).toBe('High-Value VIPs')
      expect(segment.rulesJson).toEqual({ minLtv: 10000 })
    })
  })
})
