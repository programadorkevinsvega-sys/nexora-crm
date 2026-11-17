import { SupportTicket } from '../../domain/entities/support-ticket.entity'
import { TicketReply } from '../../domain/entities/ticket-reply.entity'

describe('Support Tickets Domain Entities', () => {
  describe('SupportTicket Entity', () => {
    it('should create ticket with default OPEN status and MEDIUM priority', () => {
      const ticket = SupportTicket.create({
        tenantId: 'tenant-1',
        subject: 'API rate limit exceeded',
        description: 'Receiving HTTP 429 when calling /v1/contacts',
      })

      expect(ticket.id).toBeDefined()
      expect(ticket.status).toBe('OPEN')
      expect(ticket.priority).toBe('MEDIUM')
      expect(ticket.createdAt).toBeInstanceOf(Date)
    })

    it('should update status and handle escalation', () => {
      const ticket = SupportTicket.create({
        tenantId: 'tenant-1',
        subject: 'Critical outage',
        description: 'Service unreachable',
        priority: 'CRITICAL',
      })

      const pending = ticket.updateStatus('PENDING')
      expect(pending.status).toBe('PENDING')

      const escalated = pending.escalate()
      expect(escalated.isEscalated).toBe(true)

      const resolved = escalated.updateStatus('RESOLVED')
      expect(resolved.status).toBe('RESOLVED')
    })
  })

  describe('TicketReply Entity', () => {
    it('should create customer or agent reply with internal note flag', () => {
      const reply = TicketReply.create({
        tenantId: 'tenant-1',
        ticketId: 'ticket-1',
        authorType: 'AGENT',
        authorId: 'agent-1',
        message: 'Internal review: rate limits temporarily increased.',
        isInternalNote: true,
      })

      expect(reply.authorType).toBe('AGENT')
      expect(reply.isInternalNote).toBe(true)
    })
  })
})
