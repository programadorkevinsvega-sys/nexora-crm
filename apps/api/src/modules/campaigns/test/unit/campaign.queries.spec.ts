import { GetCampaignHandler, ListCampaignsHandler } from '../../application/queries/campaign.handlers'
import { Campaign } from '../../domain/entities/campaign.entity'
import { NotFoundError } from '@crm/shared'

describe('Campaigns Queries - Unit Tests', () => {
  let mockRepo: any

  beforeEach(() => {
    mockRepo = { findById: jest.fn(), list: jest.fn() }
  })

  describe('GetCampaignHandler', () => {
    it('should return campaign by id', async () => {
      const campaign = Campaign.create({ tenantId: 'tenant-1', name: 'Winter Sale' })
      mockRepo.findById.mockResolvedValue(campaign)

      const handler = new GetCampaignHandler(mockRepo)
      const result = await handler.execute({ tenantId: 'tenant-1', id: campaign.id })

      expect(result).toBe(campaign)
    })

    it('should throw NotFoundError when campaign not found', async () => {
      mockRepo.findById.mockResolvedValue(null)

      const handler = new GetCampaignHandler(mockRepo)
      await expect(handler.execute({ tenantId: 'tenant-1', id: 'missing' })).rejects.toThrow(NotFoundError)
    })
  })

  describe('ListCampaignsHandler', () => {
    it('should return list of campaigns', async () => {
      mockRepo.list.mockResolvedValue([])

      const handler = new ListCampaignsHandler(mockRepo)
      const result = await handler.execute({ tenantId: 'tenant-1', filter: { limit: 20 } })

      expect(result).toEqual([])
    })
  })
})
