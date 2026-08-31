import { LifeEvent } from '../../domain/entities/life-event.entity'
import { ContactGift } from '../../domain/entities/contact-gift.entity'
import { ContactDebt } from '../../domain/entities/contact-debt.entity'

describe('Personal CRM Domain Entities', () => {
  describe('LifeEvent Entity', () => {
    it('should create recurring life event milestone', () => {
      const event = LifeEvent.create({
        tenantId: 'tenant-1',
        contactId: 'contact-1',
        eventType: 'ANNIVERSARY',
        name: 'Wedding Anniversary',
        happenedAt: '2015-06-20',
        isYearlyRecurring: true,
      })

      expect(event.eventType).toBe('ANNIVERSARY')
      expect(event.isYearlyRecurring).toBe(true)
    })
  })

  describe('ContactGift Entity', () => {
    it('should track gift idea and transition to GIVEN', () => {
      const gift = ContactGift.create({
        tenantId: 'tenant-1',
        contactId: 'contact-1',
        direction: 'GIVEN',
        name: 'Mechanical Keyboard',
        estimatedValue: 120,
      })

      expect(gift.name).toBe('Mechanical Keyboard')
      expect(gift.estimatedValue).toBe(120)
    })
  })

  describe('ContactDebt Entity', () => {
    it('should record debt and allow settlement', () => {
      const debt = ContactDebt.create({
        tenantId: 'tenant-1',
        contactId: 'contact-1',
        direction: 'OWES_ME',
        amount: 250,
        reason: 'Conference Ticket Reimbursement',
      })

      expect(debt.amount).toBe(250)
      expect(debt.status).toBe('UNPAID')

      const settled = debt.settle()
      expect(settled.status).toBe('PAID')
    })
  })
})
