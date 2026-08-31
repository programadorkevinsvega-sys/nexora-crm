import { AffiliateProgram } from '../../domain/entities/affiliate-program.entity'
import { Affiliate } from '../../domain/entities/affiliate.entity'
import { AffiliateCommission } from '../../domain/entities/affiliate-commission.entity'

describe('Affiliates Domain Entities', () => {
  describe('AffiliateProgram Entity', () => {
    it('should create commission program with MLM tier support', () => {
      const program = AffiliateProgram.create({
        tenantId: 'tenant-1',
        name: 'Partner Reseller Program',
        commissionType: 'PERCENTAGE',
        commissionValue: 15,
        cookieDurationDays: 60,
        isMultiLevel: true,
        maxMlmLevels: 3,
        isActive: true,
      })

      expect(program.name).toBe('Partner Reseller Program')
      expect(program.isMultiLevel).toBe(true)
      expect(program.maxMlmLevels).toBe(3)
    })
  })

  describe('Affiliate Entity', () => {
    it('should register affiliate with custom referral link, code, and status', () => {
      const affiliate = Affiliate.create({
        tenantId: 'tenant-1',
        programId: 'prog-1',
        customerId: 'cust-1',
        referralCode: 'PARTNER-2026',
        referralLink: 'https://crm.example.com/p/PARTNER-2026',
        status: 'ACTIVE',
      })

      expect(affiliate.referralCode).toBe('PARTNER-2026')
      expect(affiliate.status).toBe('ACTIVE')
    })
  })

  describe('AffiliateCommission Entity', () => {
    it('should track commission record and allow approval tracking', () => {
      const comm = AffiliateCommission.create({
        tenantId: 'tenant-1',
        affiliateId: 'aff-1',
        sourceOrderId: 'order-999',
        commissionAmount: 150,
        status: 'APPROVED',
        approvedAt: new Date(),
      })

      expect(comm.commissionAmount).toBe(150)
      expect(comm.status).toBe('APPROVED')
      expect(comm.approvedAt).toBeInstanceOf(Date)
    })
  })
})
