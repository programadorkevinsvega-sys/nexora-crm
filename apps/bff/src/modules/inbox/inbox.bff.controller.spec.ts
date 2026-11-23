import { InboxBffController } from './inbox.bff.controller'
import { InboxBffService } from './inbox.bff.service'
import type { InboxConversation, InboxMessage } from '@crm/contracts'

describe('InboxBffController', () => {
  let controller: InboxBffController
  let mockService: jest.Mocked<InboxBffService>

  beforeEach(() => {
    mockService = {
      listConversations: jest.fn(),
      getConversation: jest.fn(),
      sendMessage: jest.fn(),
    } as unknown as jest.Mocked<InboxBffService>

    controller = new InboxBffController(mockService)
  })

  it('should call listConversations when GET /api/inbox/conversations is called', async () => {
    mockService.listConversations.mockResolvedValue([])

    const result = await controller.listConversations('WHATSAPP', 'OPEN', 'tenant-1')

    expect(mockService.listConversations).toHaveBeenCalledWith('WHATSAPP', 'OPEN', 'tenant-1')
    expect(result).toEqual([])
  })

  it('should call getConversation when GET /api/inbox/conversations/:id is called', async () => {
    const convo: InboxConversation = {
      id: '00000000-0000-0000-0000-000000000001',
      tenantId: '00000000-0000-0000-0000-000000000001',
      channel: 'WHATSAPP',
      leadScore: 80,
      leadTemperature: 'HOT',
      subject: 'Chat',
      status: 'OPEN',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      messages: [],
    }
    mockService.getConversation.mockResolvedValue(convo)

    const result = await controller.getConversation(convo.id, 'tenant-1')

    expect(mockService.getConversation).toHaveBeenCalledWith(convo.id, 'tenant-1')
    expect(result.id).toBe(convo.id)
  })

  it('should call sendMessage when POST /api/inbox/messages is called', async () => {
    const payload = {
      channel: 'WHATSAPP' as const,
      recipientIdentifier: '+573001234567',
      bodyText: 'Hello!',
    }
    const msg: InboxMessage = {
      id: '00000000-0000-0000-0000-000000000001',
      conversationId: '00000000-0000-0000-0000-000000000001',
      channel: 'WHATSAPP',
      direction: 'OUTBOUND',
      senderName: 'Agent',
      senderIdentifier: 'system',
      recipientIdentifier: '+573001234567',
      bodyText: 'Hello!',
      status: 'DELIVERED',
      sentAt: new Date().toISOString(),
    }
    mockService.sendMessage.mockResolvedValue(msg)

    const result = await controller.sendMessage(payload, 'tenant-1')

    expect(mockService.sendMessage).toHaveBeenCalledWith(payload, 'tenant-1')
    expect(result.bodyText).toBe('Hello!')
  })
})
