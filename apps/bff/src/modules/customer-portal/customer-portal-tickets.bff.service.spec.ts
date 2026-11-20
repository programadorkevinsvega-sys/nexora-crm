import { ConflictException, NotFoundException } from '@nestjs/common'
import { CustomerPortalTicketsBffService } from './customer-portal-tickets.bff.service'

describe('CustomerPortalTicketsBffService', () => {
  const user = {
    userId: '33333333-3333-4333-8333-333333333333',
    sub: '33333333-3333-4333-8333-333333333333',
    tenantId: '11111111-1111-4111-8111-111111111111',
    contactId: '22222222-2222-4222-8222-222222222222',
    customerPortal: true,
  }
  const ticket = {
    id: '44444444-4444-4444-8444-444444444444',
    contactId: user.contactId,
    subject: 'Need assistance',
    description: 'A customer issue',
    status: 'OPEN',
    priority: 'MEDIUM',
    createdAt: '2026-11-20T10:00:00.000Z',
    updatedAt: '2026-11-20T10:00:00.000Z',
  }

  let api: {
    getTicket: jest.Mock
    getTicketReplies: jest.Mock
    addTicketReply: jest.Mock
  }
  let service: CustomerPortalTicketsBffService

  beforeEach(() => {
    api = {
      getTicket: jest.fn().mockResolvedValue(ticket),
      getTicketReplies: jest.fn().mockResolvedValue({
        data: [
          { id: 'public-1', ticketId: ticket.id, authorType: 'AGENT', authorId: 'agent-1', message: 'We are investigating', isInternalNote: false, createdAt: '2026-11-20T10:01:00.000Z' },
          { id: 'private-1', ticketId: ticket.id, authorType: 'AGENT', authorId: 'agent-1', message: 'Internal note', isInternalNote: true, createdAt: '2026-11-20T10:02:00.000Z' },
        ],
        nextCursor: null,
      }),
      addTicketReply: jest.fn().mockResolvedValue({
        id: 'reply-1', ticketId: ticket.id, authorType: 'CUSTOMER',
        authorId: user.sub, message: 'More details', isInternalNote: false,
        createdAt: '2026-11-20T10:03:00.000Z',
      }),
    }
    service = new CustomerPortalTicketsBffService(api as never)
  })

  it('returns details only for the contact bound to the signed portal identity', async () => {
    await expect(service.getTicket(user, ticket.id)).resolves.toMatchObject({
      id: ticket.id,
      subject: ticket.subject,
    })
    expect(api.getTicket).toHaveBeenCalledWith(user.tenantId, ticket.id)
  })

  it('does not reveal another contact ticket', async () => {
    api.getTicket.mockResolvedValueOnce({ ...ticket, contactId: '55555555-5555-4555-8555-555555555555' })
    await expect(service.getTicket(user, ticket.id)).rejects.toBeInstanceOf(NotFoundException)
  })

  it('never returns internal notes to the customer', async () => {
    const replies = await service.listReplies(user, ticket.id)
    expect(replies).toHaveLength(1)
    expect(replies[0].message).toBe('We are investigating')
    expect(replies[0]).not.toHaveProperty('authorId')
  })

  it('creates customer replies with server-owned identity and non-internal visibility', async () => {
    await service.addReply(user, ticket.id, '  More details  ')
    expect(api.addTicketReply).toHaveBeenCalledWith({
      tenantId: user.tenantId,
      ticketId: ticket.id,
      authorType: 'CUSTOMER',
      authorId: user.sub,
      message: 'More details',
      isInternalNote: false,
    })
  })

  it('does not allow replies to a closed ticket', async () => {
    api.getTicket.mockResolvedValueOnce({ ...ticket, status: 'CLOSED' })
    await expect(service.addReply(user, ticket.id, 'Follow-up')).rejects.toBeInstanceOf(ConflictException)
    expect(api.addTicketReply).not.toHaveBeenCalled()
  })
})
