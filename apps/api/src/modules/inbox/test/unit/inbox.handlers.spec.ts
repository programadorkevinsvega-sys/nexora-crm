import { SendInboxMessageHandler } from '../../application/commands/inbox.handlers'
import {
  ListInboxConversationsHandler,
  GetInboxConversationHandler,
} from '../../application/queries/inbox.handlers'
import { SendInboxMessageCommand } from '../../application/commands/inbox.commands'
import {
  ListInboxConversationsQuery,
  GetInboxConversationQuery,
} from '../../application/queries/inbox.queries'
import { InboxRepository } from '../../domain/repositories/inbox.repository'
import { InboxConversation } from '../../domain/entities/inbox-conversation.entity'
import { InboxMessage } from '../../domain/entities/inbox-message.entity'
import { NotFoundException } from '@nestjs/common'

describe('Inbox Handlers', () => {
  let repo: jest.Mocked<InboxRepository>

  beforeEach(() => {
    repo = {
      listConversations: jest.fn(),
      getConversation: jest.fn(),
      sendMessage: jest.fn(),
    }
  })

  it('SendInboxMessageHandler should send message', async () => {
    const msg = new InboxMessage(
      'msg-1',
      'convo-1',
      'WHATSAPP',
      'OUTBOUND',
      'Agent',
      'system',
      '+573001234567',
      'Hello there!',
      null,
      'DELIVERED',
      new Date(),
    )
    repo.sendMessage.mockResolvedValue(msg)

    const handler = new SendInboxMessageHandler(repo)
    const res = await handler.execute(
      new SendInboxMessageCommand('tenant-1', 'WHATSAPP', '+573001234567', 'Hello there!', 'convo-1'),
    )

    expect(res.id).toBe('msg-1')
    expect(res.bodyText).toBe('Hello there!')
    expect(repo.sendMessage).toHaveBeenCalledTimes(1)
  })

  it('ListInboxConversationsHandler should list conversations', async () => {
    const convo = new InboxConversation(
      'convo-1',
      'tenant-1',
      'WHATSAPP',
      'contact-1',
      'Maria Gomez',
      null,
      '+573009876543',
      90,
      'HOT',
      'WhatsApp Chat',
      'OPEN',
      'I want a demo',
      new Date(),
      1,
      null,
      [],
    )
    repo.listConversations.mockResolvedValue([convo])

    const handler = new ListInboxConversationsHandler(repo)
    const list = await handler.execute(new ListInboxConversationsQuery('tenant-1', 'WHATSAPP'))

    expect(list).toHaveLength(1)
    expect(list[0].contactName).toBe('Maria Gomez')
    expect(list[0].leadTemperature).toBe('HOT')
  })

  it('GetInboxConversationHandler should throw if not found', async () => {
    repo.getConversation.mockResolvedValue(null)
    const handler = new GetInboxConversationHandler(repo)

    await expect(handler.execute(new GetInboxConversationQuery('tenant-1', 'invalid'))).rejects.toThrow(
      NotFoundException,
    )
  })
})
