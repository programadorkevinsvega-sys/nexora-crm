import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
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
import { InboxChannel, InboxConversationStatus } from '@crm/contracts'

@Controller()
export class InboxGrpcController {
  constructor(
    private readonly sendHandler: SendInboxMessageHandler,
    private readonly listHandler: ListInboxConversationsHandler,
    private readonly getHandler: GetInboxConversationHandler,
  ) {}

  @GrpcMethod('InboxService', 'ListConversations')
  async listConversations(data: {
    tenantId: string
    channel?: string
    status?: string
  }) {
    const list = await this.listHandler.execute(
      new ListInboxConversationsQuery(
        data.tenantId,
        data.channel as InboxChannel,
        data.status as InboxConversationStatus,
      ),
    )
    return { jsonItems: list.map((c) => JSON.stringify(c)) }
  }

  @GrpcMethod('InboxService', 'GetConversation')
  async getConversation(data: { tenantId: string; id: string }) {
    const convo = await this.getHandler.execute(
      new GetInboxConversationQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(convo) }
  }

  @GrpcMethod('InboxService', 'SendMessage')
  async sendMessage(data: {
    tenantId: string
    conversationId?: string
    contactId?: string
    channel: string
    recipientIdentifier: string
    subject?: string
    bodyText: string
  }) {
    const msg = await this.sendHandler.execute(
      new SendInboxMessageCommand(
        data.tenantId,
        data.channel as InboxChannel,
        data.recipientIdentifier,
        data.bodyText,
        data.conversationId,
        data.contactId,
        data.subject,
      ),
    )
    return { json: JSON.stringify(msg) }
  }
}
