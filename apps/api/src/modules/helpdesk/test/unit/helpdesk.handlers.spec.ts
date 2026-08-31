import { CreateConversationHandler, AssignConversationHandler } from '../../application/commands/helpdesk.handlers'
import { HelpdeskConversation } from '../../domain/entities/conversation.entity'

describe('Helpdesk Module - Unit Tests', () => {
  let mockConversationRepo: any
  let mockOutbox: any

  beforeEach(() => {
    mockConversationRepo = { save: jest.fn().mockResolvedValue(undefined), findById: jest.fn() }
    mockOutbox = { publish: jest.fn().mockResolvedValue(undefined) }
  })

  describe('CreateConversationHandler', () => {
    it('should create an omnichannel conversation thread with outbox event', async () => {
      const handler = new CreateConversationHandler(mockConversationRepo, mockOutbox)
      const result = await handler.execute({
        tenantId: 'tenant-1',
        mailboxId: 'mb-1',
        subject: 'Billing inquiry Q3',
        customerEmail: 'customer@example.com',
        sourceChannel: 'EMAIL',
      })

      expect(result.id).toBeDefined()
      expect(mockConversationRepo.save).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalledTimes(1)
    })
  })

  describe('AssignConversationHandler', () => {
    it('should reassign conversation to support agent', async () => {
      const conversation = HelpdeskConversation.create({
        tenantId: 'tenant-1',
        mailboxId: 'mb-1',
        subject: 'Support Help',
        customerEmail: 'c@test.com',
      })
      mockConversationRepo.findById.mockResolvedValue(conversation)

      const handler = new AssignConversationHandler(mockConversationRepo, mockOutbox)
      await handler.execute({
        tenantId: 'tenant-1',
        conversationId: conversation.id,
        assigneeUserId: 'agent-42',
      })

      expect(mockConversationRepo.save).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalled()
    })
  })
})
