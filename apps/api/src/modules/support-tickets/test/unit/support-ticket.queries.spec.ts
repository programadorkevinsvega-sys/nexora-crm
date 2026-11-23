import { GetTicketHandler, ListTicketsHandler } from '../../application/queries/support-ticket.handlers'
import { SupportTicket } from '../../domain/entities/support-ticket.entity'
import { TicketReply } from '../../domain/entities/ticket-reply.entity'
import { NotFoundError } from '@crm/shared'

describe('Support Tickets Queries - Unit Tests', () => {
  let mockTicketRepo: any
  let mockReplyRepo: any

  beforeEach(() => {
    mockTicketRepo = { findById: jest.fn(), list: jest.fn() }
    mockReplyRepo = { findByTicketId: jest.fn() }
  })

  describe('GetTicketHandler', () => {
    it('should return ticket along with conversational thread replies', async () => {
      const ticket = SupportTicket.create({ tenantId: 'tenant-1', subject: 'Login issue', description: 'desc' })
      const replies = [TicketReply.create({ tenantId: 'tenant-1', ticketId: ticket.id, authorType: 'AGENT', authorId: 'a-1', message: 'Hello' })]
      mockTicketRepo.findById.mockResolvedValue(ticket)
      mockReplyRepo.findByTicketId.mockResolvedValue(replies)

      const handler = new GetTicketHandler(mockTicketRepo, mockReplyRepo)
      const result = await handler.execute({ tenantId: 'tenant-1', id: ticket.id })

      expect(result.ticket).toBe(ticket)
      expect(result.replies).toEqual(replies)
    })

    it('should throw NotFoundError when ticket does not exist', async () => {
      mockTicketRepo.findById.mockResolvedValue(null)

      const handler = new GetTicketHandler(mockTicketRepo, mockReplyRepo)
      await expect(handler.execute({ tenantId: 'tenant-1', id: 'missing' })).rejects.toThrow(NotFoundError)
    })
  })

  describe('ListTicketsHandler', () => {
    it('should query tickets with filter predicates', async () => {
      mockTicketRepo.list.mockResolvedValue([])

      const handler = new ListTicketsHandler(mockTicketRepo)
      const result = await handler.execute({ tenantId: 'tenant-1', filter: { status: 'OPEN', limit: 20 } })

      expect(result).toEqual([])
      expect(mockTicketRepo.list).toHaveBeenCalledWith('tenant-1', { status: 'OPEN', limit: 20 })
    })
  })
})
