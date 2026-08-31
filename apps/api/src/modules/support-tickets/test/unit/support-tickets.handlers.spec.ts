import { CreateTicketHandler, UpdateTicketStatusHandler, AddReplyHandler } from '../../application/commands/support-ticket.handlers'
import { SupportTicket } from '../../domain/entities/support-ticket.entity'

describe('Support Tickets Module - Unit Tests', () => {
  let mockTicketRepo: any
  let mockReplyRepo: any
  let mockOutbox: any

  beforeEach(() => {
    mockTicketRepo = { save: jest.fn().mockResolvedValue(undefined), findById: jest.fn() }
    mockReplyRepo = { save: jest.fn().mockResolvedValue(undefined) }
    mockOutbox = { publish: jest.fn().mockResolvedValue(undefined) }
  })

  describe('CreateTicketHandler', () => {
    it('should create a support ticket and emit TicketCreatedEvent', async () => {
      const handler = new CreateTicketHandler(mockTicketRepo, mockOutbox)
      const result = await handler.execute({
        tenantId: 'tenant-1',
        subject: 'Cannot login to portal',
        description: 'Receiving 403 error on dashboard',
        priority: 'HIGH',
      })

      expect(result.id).toBeDefined()
      expect(mockTicketRepo.save).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalledTimes(1)
    })
  })

  describe('UpdateTicketStatusHandler', () => {
    it('should update ticket status to RESOLVED and emit TicketResolvedEvent', async () => {
      const ticket = SupportTicket.create({ tenantId: 'tenant-1', subject: 'Bug fix', description: 'desc', priority: 'LOW' })
      mockTicketRepo.findById.mockResolvedValue(ticket)

      const handler = new UpdateTicketStatusHandler(mockTicketRepo, mockOutbox)
      await handler.execute({ tenantId: 'tenant-1', id: ticket.id, status: 'RESOLVED' })

      expect(mockTicketRepo.save).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalled()
    })
  })

  describe('AddReplyHandler', () => {
    it('should add agent reply and emit ReplyAddedEvent', async () => {
      const ticket = SupportTicket.create({ tenantId: 'tenant-1', subject: 'Query', description: 'desc' })
      mockTicketRepo.findById.mockResolvedValue(ticket)

      const handler = new AddReplyHandler(mockTicketRepo, mockReplyRepo, mockOutbox)
      const result = await handler.execute({
        tenantId: 'tenant-1',
        ticketId: ticket.id,
        message: 'We have updated your permissions. Please try again.',
        authorType: 'AGENT',
        authorId: 'agent-1',
        isInternalNote: false,
      })

      expect(result.id).toBeDefined()
      expect(mockReplyRepo.save).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalledTimes(1)
    })
  })
})
