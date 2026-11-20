import { NotFoundException } from '@nestjs/common'
import { CustomerPortalBffService } from './customer-portal.bff.service'

describe('CustomerPortalBffService', () => {
  const tenantId = '11111111-1111-4111-8111-111111111111'
  const contactId = '22222222-2222-4222-8222-222222222222'
  const ownedDeal = {
    id: '33333333-3333-4333-8333-333333333333',
    tenantId,
    contactId,
    name: 'Renewal opportunity',
    currency: 'COP',
  }

  let api: Record<string, jest.Mock>
  let service: CustomerPortalBffService

  beforeEach(() => {
    api = {
      getContact: jest.fn().mockResolvedValue({ id: contactId, tenantId }),
      getCustomerPortalOverview: jest.fn().mockResolvedValue({ contactId, contactName: 'Customer' }),
      listTickets: jest.fn().mockResolvedValue({ data: [], nextCursor: null }),
      listDeals: jest.fn().mockResolvedValue({ data: [ownedDeal], nextCursor: null }),
      listQuotes: jest.fn().mockResolvedValue({
        data: [{
          id: '44444444-4444-4444-8444-444444444444',
          quoteNumber: 'Q-100',
          status: 'SENT',
          grandTotal: 119,
          validUntil: '2026-12-31',
          createdAt: '2026-11-20T10:00:00.000Z',
        }],
        nextCursor: null,
      }),
      listKbCategories: jest.fn().mockResolvedValue([]),
      listKbArticles: jest.fn().mockResolvedValue([]),
      createTicket: jest.fn(),
    }
    service = new CustomerPortalBffService(api as never)
  })

  it('loads customer quotes through owned deals and Contracts gRPC instead of cross-module SQL joins', async () => {
    const result = await service.getMyPortal({
      sub: '55555555-5555-4555-8555-555555555555',
      userId: '55555555-5555-4555-8555-555555555555',
      tenantId,
      contactId,
      customerPortal: true,
    })

    expect(api.listDeals).toHaveBeenCalledWith({ tenantId, contactId, limit: 100 })
    expect(api.listQuotes).toHaveBeenCalledWith({ tenantId, dealId: ownedDeal.id, limit: 100 })
    expect(result.quotes).toEqual([expect.objectContaining({
      id: '44444444-4444-4444-8444-444444444444',
      currency: 'COP',
      grandTotal: 119,
    })])
  })

  it('rejects a contact response that does not belong to the signed tenant', async () => {
    api.getContact.mockResolvedValueOnce({ id: contactId, tenantId: '99999999-9999-4999-8999-999999999999' })
    await expect(service.getMyPortal({
      sub: '55555555-5555-4555-8555-555555555555',
      userId: '55555555-5555-4555-8555-555555555555',
      tenantId,
      contactId,
      customerPortal: true,
    })).rejects.toBeInstanceOf(NotFoundException)
    expect(api.listDeals).not.toHaveBeenCalled()
  })
})
