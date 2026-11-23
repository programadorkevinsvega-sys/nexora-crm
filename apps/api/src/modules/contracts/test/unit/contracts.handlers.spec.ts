import { CreateContractHandler, RenewContractHandler } from '../../application/commands/contract.handlers'
import { AcceptQuoteHandler, RejectQuoteHandler } from '../../application/commands/quote.handlers'
import { Quote } from '../../domain/entities/quote.entity'
import { Contract } from '../../domain/entities/contract.entity'
import { ConflictError } from '@crm/shared'

describe('Contracts Module - Unit Tests', () => {
  let mockRepo: any
  let mockOutbox: any

  beforeEach(() => {
    mockRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      transitionStatus: jest.fn().mockResolvedValue(true),
    }
    mockOutbox = { publish: jest.fn().mockResolvedValue(undefined) }
  })

  describe('CreateContractHandler', () => {
    it('should create and persist a customer contract with MRR value', async () => {
      const handler = new CreateContractHandler(mockRepo, mockOutbox)
      const result = await handler.execute({
        tenantId: 'tenant-1',
        companyId: 'company-1',
        dealId: undefined,
        name: 'Enterprise Annual License',
        startDate: '2026-01-01',
        endDate: '2027-01-01',
        autoRenew: true,
        mrrValue: 2500,
        ownerUserId: 'rep-1',
      })

      expect(result.id).toBeDefined()
      expect(mockRepo.save).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalledTimes(1)
    })
  })

  describe('Customer quote decisions', () => {
    const sentQuote = Quote.create({
      tenantId: 'tenant-1',
      dealId: 'deal-1',
      quoteNumber: 'Q-100',
      validUntil: '2026-12-31',
      subtotal: 100,
      taxTotal: 19,
      grandTotal: 119,
    }).updateStatus('SENT')

    it('includes the authenticated portal actor in the accepted quote event', async () => {
      mockRepo.findById.mockResolvedValue(sentQuote)
      const handler = new AcceptQuoteHandler(mockRepo, mockOutbox)

      await handler.execute({
        tenantId: 'tenant-1',
        id: sentQuote.id,
        actorId: 'portal-account-1',
        actorType: 'CUSTOMER_PORTAL',
      })

      expect(mockRepo.transitionStatus).toHaveBeenCalledWith('tenant-1', sentQuote.id, 'SENT', 'ACCEPTED')
      expect(mockOutbox.publish).toHaveBeenCalledWith(expect.objectContaining({
        aggregateId: sentQuote.id,
        actorId: 'portal-account-1',
        actorType: 'CUSTOMER_PORTAL',
      }))
    })

    it('rejects concurrent decisions when another request already transitioned the quote', async () => {
      mockRepo.findById.mockResolvedValue(sentQuote)
      mockRepo.transitionStatus.mockResolvedValueOnce(false)
      const handler = new AcceptQuoteHandler(mockRepo, mockOutbox)

      await expect(handler.execute({
        tenantId: 'tenant-1',
        id: sentQuote.id,
        actorId: 'portal-account-1',
        actorType: 'CUSTOMER_PORTAL',
      })).rejects.toBeInstanceOf(ConflictError)

      expect(mockOutbox.publish).not.toHaveBeenCalled()
    })

    it('does not accept expired quotes', async () => {
      const expiredQuote = Quote.create({
        tenantId: 'tenant-1',
        dealId: 'deal-1',
        quoteNumber: 'Q-OLD',
        validUntil: '2026-01-01',
        subtotal: 100,
        taxTotal: 19,
        grandTotal: 119,
      }).updateStatus('SENT')
      mockRepo.findById.mockResolvedValue(expiredQuote)
      const handler = new AcceptQuoteHandler(mockRepo, mockOutbox)

      await expect(handler.execute({
        tenantId: 'tenant-1',
        id: expiredQuote.id,
      })).rejects.toBeInstanceOf(ConflictError)
      expect(mockRepo.transitionStatus).not.toHaveBeenCalled()
    })

    it('includes the authenticated portal actor and reason in the rejected quote event', async () => {
      mockRepo.findById.mockResolvedValue(sentQuote)
      const handler = new RejectQuoteHandler(mockRepo, mockOutbox)

      await handler.execute({
        tenantId: 'tenant-1',
        id: sentQuote.id,
        reason: 'Budget constraints',
        actorId: 'portal-account-1',
        actorType: 'CUSTOMER_PORTAL',
      })

      expect(mockRepo.transitionStatus).toHaveBeenCalledWith('tenant-1', sentQuote.id, 'SENT', 'REJECTED')
      expect(mockOutbox.publish).toHaveBeenCalledWith(expect.objectContaining({
        aggregateId: sentQuote.id,
        reason: 'Budget constraints',
        actorId: 'portal-account-1',
        actorType: 'CUSTOMER_PORTAL',
      }))
    })
  })

  describe('RenewContractHandler', () => {
    it('should renew existing active contract and emit event', async () => {
      const contract = Contract.create({
        tenantId: 'tenant-1',
        companyId: 'c-1',
        name: 'SaaS Agreement',
        startDate: '2025-01-01',
        endDate: '2026-01-01',
        mrrValue: 1000,
        ownerUserId: 'user-1',
      }).updateStatus('ACTIVE')
      mockRepo.findById.mockResolvedValue(contract)

      const handler = new RenewContractHandler(mockRepo, mockOutbox)
      await handler.execute({
        tenantId: 'tenant-1',
        id: contract.id,
      })

      expect(mockRepo.save).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalled()
    })
  })
})
