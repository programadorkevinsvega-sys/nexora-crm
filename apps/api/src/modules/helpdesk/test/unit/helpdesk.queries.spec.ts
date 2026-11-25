import { GetConversationHandler, ListThreadsHandler } from '../../application/queries/helpdesk.handlers'
import { HelpdeskConversation } from '../../domain/entities/conversation.entity'
import { HelpdeskThread } from '../../domain/entities/thread.entity'
import { NotFoundError } from '@crm/shared'

describe('Helpdesk Queries - Unit Tests', () => {
  let mockConvRepo: any
  let mockThreadRepo: any

  beforeEach(() => {
    mockConvRepo = { findById: jest.fn(), list: jest.fn() }
    mockThreadRepo = { findByConversationId: jest.fn() }
  })

  describe('GetConversationHandler', () => {
    it('should return omnichannel conversation by id', async () => {
      const conv = HelpdeskConversation.create({ tenantId: 'tenant-1', mailboxId: 'mb-1', subject: 'Refund', customerEmail: 'c@test.com' })
      mockConvRepo.findById.mockResolvedValue(conv)

      const handler = new GetConversationHandler(mockConvRepo)
      const result = await handler.execute({ tenantId: 'tenant-1', id: conv.id })

      expect(result).toBe(conv)
    })

    it('should throw NotFoundError if conversation does not exist', async () => {
      mockConvRepo.findById.mockResolvedValue(null)

      const handler = new GetConversationHandler(mockConvRepo)
      await expect(handler.execute({ tenantId: 'tenant-1', id: 'missing' })).rejects.toThrow(NotFoundError)
    })
  })

  describe('ListThreadsHandler', () => {
    it('should return message threads for conversation', async () => {
      const threads = [HelpdeskThread.create({ tenantId: 'tenant-1', conversationId: 'c-1', threadType: 'MESSAGE', bodyText: 'Help' })]
      mockThreadRepo.findByConversationId.mockResolvedValue(threads)

      const handler = new ListThreadsHandler(mockThreadRepo)
      const result = await handler.execute({ tenantId: 'tenant-1', conversationId: 'c-1' })

      expect(result).toEqual(threads)
    })
  })
})
