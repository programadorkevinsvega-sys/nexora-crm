import { Contract } from '../../domain/entities/contract.entity'
import { Quote } from '../../domain/entities/quote.entity'

describe('Contracts & Quotes Domain Entities', () => {
  describe('Contract Entity', () => {
    it('should create contract with default DRAFT status and MRR value', () => {
      const contract = Contract.create({
        tenantId: 'tenant-1',
        companyId: 'company-1',
        name: 'Annual Support SLA',
        startDate: '2026-01-01',
        endDate: '2027-01-01',
        autoRenew: true,
        mrrValue: 5000,
        ownerUserId: 'rep-1',
      })

      expect(contract.status).toBe('DRAFT')
      expect(contract.autoRenew).toBe(true)
      expect(contract.mrrValue).toBe(5000)
    })

    it('should transition status through contract lifecycle', () => {
      const contract = Contract.create({
        tenantId: 'tenant-1',
        companyId: 'company-1',
        name: 'SaaS Agreement',
        startDate: '2026-01-01',
        ownerUserId: 'rep-1',
      })

      const active = contract.updateStatus('ACTIVE')
      expect(active.status).toBe('ACTIVE')

      const renewed = active.updateStatus('RENEWED')
      expect(renewed.status).toBe('RENEWED')

      const cancelled = active.updateStatus('CANCELLED')
      expect(cancelled.status).toBe('CANCELLED')
    })
  })

  describe('Quote Entity', () => {
    it('should create a price quote linked to deal with totals', () => {
      const quote = Quote.create({
        tenantId: 'tenant-1',
        dealId: 'deal-1',
        quoteNumber: 'Q-2026-001',
        validUntil: '2026-12-31',
        subtotal: 10000,
        taxTotal: 2500,
        grandTotal: 12500,
      })

      expect(quote.quoteNumber).toBe('Q-2026-001')
      expect(quote.grandTotal).toBe(12500)
    })
  })
})
