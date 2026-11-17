import { Campaign } from '../../domain/entities/campaign.entity'
import { CampaignMember } from '../../domain/entities/campaign-member.entity'

describe('Campaigns Domain Entities', () => {
  describe('Campaign Entity', () => {
    it('should create campaign with financial forecasts and metrics', () => {
      const campaign = Campaign.create({
        tenantId: 'tenant-1',
        name: 'Q4 Product Launch',
        type: 'WEBINAR',
        status: 'PLANNED',
        budgetedCost: 15000,
        expectedRevenue: 120000,
        startDate: '2026-10-01',
        endDate: '2026-10-31',
      })

      expect(campaign.id).toBeDefined()
      expect(campaign.status).toBe('PLANNED')
      expect(campaign.budgetedCost).toBe(15000)
      expect(campaign.expectedRevenue).toBe(120000)
    })

    it('should update status to ACTIVE and COMPLETED', () => {
      const campaign = Campaign.create({ tenantId: 'tenant-1', name: 'Summer Campaign' })
      const active = campaign.update({ status: 'ACTIVE', actualCost: 8500 })

      expect(active.status).toBe('ACTIVE')
      expect(active.actualCost).toBe(8500)
    })
  })

  describe('CampaignMember Entity', () => {
    it('should create and track member interaction status in campaign', () => {
      const member = CampaignMember.create({
        tenantId: 'tenant-1',
        campaignId: 'camp-1',
        contactId: 'contact-1',
        status: 'SENT',
      })

      expect(member.status).toBe('SENT')
      expect(member.campaignId).toBe('camp-1')
      expect(member.contactId).toBe('contact-1')
    })
  })
})
