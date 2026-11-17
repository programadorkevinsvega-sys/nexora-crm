import { ListLifeEventsHandler, ListGiftsHandler, ListDebtsHandler } from '../../application/queries/personal-crm.handlers'
import { LifeEvent } from '../../domain/entities/life-event.entity'
import { ContactGift } from '../../domain/entities/contact-gift.entity'
import { ContactDebt } from '../../domain/entities/contact-debt.entity'

describe('Personal CRM Queries - Unit Tests', () => {
  let mockRepo: any

  beforeEach(() => {
    mockRepo = {
      listLifeEvents: jest.fn(),
      listGifts: jest.fn(),
      listDebts: jest.fn(),
    }
  })

  describe('ListLifeEventsHandler', () => {
    it('should list life events for a contact', async () => {
      const events = [LifeEvent.create({ tenantId: 'tenant-1', contactId: 'c-1', eventType: 'BIRTHDAY', name: 'Birthday', happenedAt: '1990-05-15' })]
      mockRepo.listLifeEvents.mockResolvedValue(events)

      const handler = new ListLifeEventsHandler(mockRepo)
      const result = await handler.execute({ tenantId: 'tenant-1', contactId: 'c-1' })

      expect(result).toEqual(events)
      expect(mockRepo.listLifeEvents).toHaveBeenCalledWith('tenant-1', 'c-1')
    })
  })

  describe('ListGiftsHandler', () => {
    it('should list gifts for contact', async () => {
      const gifts = [ContactGift.create({ tenantId: 'tenant-1', contactId: 'c-1', direction: 'GIVEN', name: 'Book' })]
      mockRepo.listGifts.mockResolvedValue(gifts)

      const handler = new ListGiftsHandler(mockRepo)
      const result = await handler.execute({ tenantId: 'tenant-1', contactId: 'c-1' })

      expect(result).toEqual(gifts)
    })
  })

  describe('ListDebtsHandler', () => {
    it('should list debts for contact', async () => {
      const debts = [ContactDebt.create({ tenantId: 'tenant-1', contactId: 'c-1', direction: 'OWES_ME', amount: 100, reason: 'Lunch' })]
      mockRepo.listDebts.mockResolvedValue(debts)

      const handler = new ListDebtsHandler(mockRepo)
      const result = await handler.execute({ tenantId: 'tenant-1', contactId: 'c-1' })

      expect(result).toEqual(debts)
    })
  })
})
