import { BiDataFeedHelper } from '../bi-data-feed.helper'

describe('BiDataFeedHelper', () => {
  it('should format deals into tabular Power BI feed', () => {
    const deals = [{
      id: 'deal-1',
      name: 'Enterprise CRM Rollout',
      amount: '45000',
      stageId: 'stage-prop',
      status: 'OPEN',
      probabilityOverride: 70,
      expectedCloseDate: '2026-12-31',
      createdAt: new Date(),
      updatedAt: new Date(),
    }]

    const feed = BiDataFeedHelper.formatDealsFeed(deals)
    expect(feed).toHaveLength(1)
    expect(feed[0].DealTitle).toBe('Enterprise CRM Rollout')
    expect(feed[0].ValueUSD).toBe(45000)
    expect(feed[0].Probability).toBe(70)
  })

  it('should format contacts into tabular Power BI feed', () => {
    const contacts = [{
      id: 'contact-1',
      firstName: 'Laura',
      lastName: 'García',
      email: 'laura@enterprise.com',
      phone: '+573001234567',
      companyId: 'comp-1',
      leadStatus: 'CUSTOMER',
      createdAt: new Date(),
    }]

    const feed = BiDataFeedHelper.formatContactsFeed(contacts)
    expect(feed).toHaveLength(1)
    expect(feed[0].FullName).toBe('Laura García')
    expect(feed[0].LifecycleStage).toBe('CUSTOMER')
  })
})