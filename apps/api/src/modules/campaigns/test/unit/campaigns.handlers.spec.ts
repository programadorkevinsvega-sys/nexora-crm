import { CreateCampaignHandler, ChangeCampaignStatusHandler } from '../../application/commands/campaign.handlers'
import { Campaign } from '../../domain/entities/campaign.entity'

describe('Campaigns Module - Unit Tests', () => {
  let mockRepo: any
  let mockOutbox: any

  beforeEach(() => {
    mockRepo = { save: jest.fn().mockResolvedValue(undefined), findById: jest.fn() }
    mockOutbox = { publish: jest.fn().mockResolvedValue(undefined) }
  })

  describe('CreateCampaignHandler', () => {
    it('should create and save a marketing campaign with outbox event', async () => {
      const handler = new CreateCampaignHandler(mockRepo, mockOutbox)
      const result = await handler.execute({
        tenantId: 'tenant-1',
        name: 'Black Friday 2026 Promo',
        type: 'EMAIL',
        budgetedCost: 5000,
        expectedRevenue: 50000,
      })

      expect(result.id).toBeDefined()
      expect(mockRepo.save).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalledTimes(1)
    })
  })

  describe('ChangeCampaignStatusHandler', () => {
    it('should transition campaign status to ACTIVE and emit event', async () => {
      const campaign = Campaign.create({ tenantId: 'tenant-1', name: 'Spring Launch', status: 'PLANNED' })
      mockRepo.findById.mockResolvedValue(campaign)

      const handler = new ChangeCampaignStatusHandler(mockRepo, mockOutbox)
      await handler.execute({ tenantId: 'tenant-1', id: campaign.id, status: 'ACTIVE' })

      expect(mockRepo.save).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalled()
    })
  })
})
