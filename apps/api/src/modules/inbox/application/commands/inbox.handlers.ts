import { Injectable } from '@nestjs/common'
import { SendInboxMessageCommand } from './inbox.commands'
import { InboxRepository } from '../../domain/repositories/inbox.repository'
import { InboxMessage } from '../../domain/entities/inbox-message.entity'

@Injectable()
export class SendInboxMessageHandler {
  constructor(private readonly repo: InboxRepository) {}

  async execute(command: SendInboxMessageCommand): Promise<InboxMessage> {
    return this.repo.sendMessage(command.tenantId, {
      conversationId: command.conversationId,
      contactId: command.contactId,
      channel: command.channel,
      recipientIdentifier: command.recipientIdentifier,
      subject: command.subject,
      bodyText: command.bodyText,
    })
  }
}
