import { DrizzleConversationRepository } from '../../infrastructure/drizzle-conversation.repository'
import { HelpdeskConversation } from '../../domain/entities/conversation.entity'
import * as dbModule from '@crm/database'

describe('DrizzleConversationRepository - Persistence Integration Tests', () => {
  let repository: DrizzleConversationRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      query: {
        helpdeskConversations: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
      },
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockResolvedValue(undefined),
        }),
      }),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    repository = new DrizzleConversationRepository()
  })

  it('should find conversation and map customer email and mailbox', async () => {
    mockDb.query.helpdeskConversations.findFirst.mockResolvedValue({
      id: 'conv-10',
      tenantId: 'tenant-1',
      mailboxId: 'mb-support',
      customerEmail: 'customer@client.test',
      subject: 'SSO configuration',
      status: 'OPEN',
      priority: 'MEDIUM',
      messageCount: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const conv = await repository.findById('tenant-1', 'conv-10')

    expect(conv).not.toBeNull()
    expect(conv?.customerEmail).toBe('customer@client.test')
    expect(conv?.subject).toBe('SSO configuration')
  })

  it('should save conversation entity', async () => {
    const conv = HelpdeskConversation.create({
      tenantId: 'tenant-1',
      mailboxId: 'mb-support',
      subject: 'Inquiry',
      customerEmail: 'inquiry@client.test',
    })

    await repository.save(conv)

    expect(mockDb.insert).toHaveBeenCalled()
  })
})
