import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common'
import { CustomerPortalQuotesBffService } from './customer-portal-quotes.bff.service'

describe('CustomerPortalQuotesBffService', () => {
  const user = {
    userId: '33333333-3333-4333-8333-333333333333',
    sub: '33333333-3333-4333-8333-333333333333',
    tenantId: '11111111-1111-4111-8111-111111111111',
    contactId: '22222222-2222-4222-8222-222222222222',
    customerPortal: true,
  }
  const quote = {
    id: '66666666-6666-4666-8666-666666666666',
    tenantId: user.tenantId,
    dealId: '44444444-4444-4444-8444-444444444444',
    quoteNumber: 'Q-100',
    status: 'SENT',
    validUntil: '2026-12-31',
    termsAndConditions: 'Net 30',
    subtotal: 100,
    taxTotal: 19,
    grandTotal: 119,
    createdAt: '2026-11-20T10:00:00.000Z',
    updatedAt: '2026-11-20T10:00:00.000Z',
  }
  const deal = {
    id: quote.dealId,
    tenantId: user.tenantId,
    contactId: user.contactId,
    name: 'Customer renewal',
    currency: 'COP',
  }

  let api: {
    getQuote: jest.Mock
    getDeal: jest.Mock
    acceptQuote: jest.Mock
    rejectQuote: jest.Mock
  }
  let service: CustomerPortalQuotesBffService

  beforeEach(() => {
    api = {
      getQuote: jest.fn().mockResolvedValue(quote),
      getDeal: jest.fn().mockResolvedValue(deal),
      acceptQuote: jest.fn().mockResolvedValue(undefined),
      rejectQuote: jest.fn().mockResolvedValue(undefined),
    }
    service = new CustomerPortalQuotesBffService(api as never)
  })

  it('returns only quote details whose related deal belongs to the signed contact', async () => {
    await expect(service.getQuote(user, quote.id)).resolves.toMatchObject({
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      dealName: deal.name,
      currency: 'COP',
    })
    expect(api.getQuote).toHaveBeenCalledWith(user.tenantId, quote.id)
    expect(api.getDeal).toHaveBeenCalledWith(user.tenantId, quote.dealId)
  })

  it('does not disclose a draft quote to the customer', async () => {
    api.getQuote.mockResolvedValueOnce({ ...quote, status: 'DRAFT' })
    await expect(service.getQuote(user, quote.id)).rejects.toBeInstanceOf(NotFoundException)
    expect(api.getDeal).not.toHaveBeenCalled()
  })

  it('does not disclose a quote returned for a different tenant', async () => {
    api.getQuote.mockResolvedValueOnce({ ...quote, tenantId: '99999999-9999-4999-8999-999999999999' })
    await expect(service.getQuote(user, quote.id)).rejects.toBeInstanceOf(NotFoundException)
    expect(api.getDeal).not.toHaveBeenCalled()
  })

  it('does not disclose a quote linked to another contact', async () => {
    api.getDeal.mockResolvedValueOnce({ ...deal, contactId: '55555555-5555-4555-8555-555555555555' })
    await expect(service.getQuote(user, quote.id)).rejects.toBeInstanceOf(NotFoundException)
  })

  it('accepts only a sent and unexpired quote and records the portal actor', async () => {
    await service.acceptQuote(user, quote.id)
    expect(api.acceptQuote).toHaveBeenCalledWith({
      tenantId: user.tenantId,
      id: quote.id,
      actorId: user.sub,
      actorType: 'CUSTOMER_PORTAL',
    })
  })

  it('does not allow decisions on a quote that is not sent', async () => {
    api.getQuote.mockResolvedValueOnce({ ...quote, status: 'DRAFT' })
    await expect(service.acceptQuote(user, quote.id)).rejects.toBeInstanceOf(ConflictException)
    expect(api.acceptQuote).not.toHaveBeenCalled()
  })

  it('does not allow decisions on an expired quote', async () => {
    api.getQuote.mockResolvedValueOnce({ ...quote, validUntil: '2026-01-01' })
    await expect(service.acceptQuote(user, quote.id)).rejects.toBeInstanceOf(ConflictException)
    expect(api.acceptQuote).not.toHaveBeenCalled()
  })

  it('requires a meaningful rejection reason and records the portal actor', async () => {
    await expect(service.rejectQuote(user, quote.id, 'No')).rejects.toBeInstanceOf(BadRequestException)
    await service.rejectQuote(user, quote.id, 'Budget no longer available')
    expect(api.rejectQuote).toHaveBeenCalledWith({
      tenantId: user.tenantId,
      id: quote.id,
      reason: 'Budget no longer available',
      actorId: user.sub,
      actorType: 'CUSTOMER_PORTAL',
    })
  })
})
