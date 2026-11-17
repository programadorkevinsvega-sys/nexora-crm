import { CreateLifeEventHandler, CreateGiftHandler } from '../../application/commands/personal-crm.handlers'

describe('Personal CRM Module - Unit Tests', () => {
  let mockRepo: any
  let mockOutbox: any

  beforeEach(() => {
    mockRepo = { saveLifeEvent: jest.fn().mockResolvedValue(undefined), saveGift: jest.fn().mockResolvedValue(undefined) }
    mockOutbox = { publish: jest.fn().mockResolvedValue(undefined) }
  })

  describe('CreateLifeEventHandler', () => {
    it('should track a personal relationship life event (birthday, anniversary)', async () => {
      const handler = new CreateLifeEventHandler(mockRepo, mockOutbox)
      const result = await handler.execute({
        tenantId: 'tenant-1',
        contactId: 'contact-1',
        eventType: 'BIRTHDAY',
        name: 'John Birthday',
        happenedAt: '1990-05-15',
        isYearlyRecurring: true,
      })

      expect(result.id).toBeDefined()
      expect(mockRepo.saveLifeEvent).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalledTimes(1)
    })
  })

  describe('CreateGiftHandler', () => {
    it('should log a gift given to/from a contact', async () => {
      const handler = new CreateGiftHandler(mockRepo, mockOutbox)
      const result = await handler.execute({
        tenantId: 'tenant-1',
        contactId: 'contact-1',
        direction: 'GIVEN',
        name: 'Vintage Wine Bottle',
        estimatedValue: 150,
        status: 'GIVEN',
      })

      expect(result.id).toBeDefined()
      expect(mockRepo.saveGift).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalled()
    })
  })
})
