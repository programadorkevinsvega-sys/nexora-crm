import { HelpdeskConversation } from '../../domain/entities/conversation.entity'
import { HelpdeskThread } from '../../domain/entities/thread.entity'

describe('Helpdesk Domain Entities', () => {
  describe('HelpdeskConversation Entity', () => {
    it('should create omnichannel conversation with default OPEN status', () => {
      const conv = HelpdeskConversation.create({
        tenantId: 'tenant-1',
        mailboxId: 'mb-1',
        subject: 'SSO Login Integration Failure',
        customerEmail: 'admin@acme.com',
        sourceChannel: 'EMAIL',
      })

      expect(conv.id).toBeDefined()
      expect(conv.status).toBe('OPEN')
      expect(conv.sourceChannel).toBe('EMAIL')
    })

    it('should assign to agent and resolve conversation', () => {
      const conv = HelpdeskConversation.create({
        tenantId: 'tenant-1',
        mailboxId: 'mb-1',
        subject: 'Query',
        customerEmail: 'c@test.com',
      })

      const assigned = conv.assign('agent-99')
      expect(assigned.assigneeUserId).toBe('agent-99')

      const resolved = assigned.resolve()
      expect(resolved.status).toBe('RESOLVED')
    })
  })

  describe('HelpdeskThread Entity', () => {
    it('should create conversation message thread', () => {
      const thread = HelpdeskThread.create({
        tenantId: 'tenant-1',
        conversationId: 'conv-1',
        threadType: 'MESSAGE',
        createdByUserId: 'agent-1',
        bodyText: 'We found the issue in your SAML assertion.',
      })

      expect(thread.threadType).toBe('MESSAGE')
      expect(thread.bodyText).toBe('We found the issue in your SAML assertion.')
    })
  })
})
