import { Controller, Get, Post, Param, Query, Body, Headers, ParseUUIDPipe } from '@nestjs/common'
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

@Controller('inbox')
export class InboxController {
  constructor(
    private readonly sendHandler: SendInboxMessageHandler,
    private readonly listHandler: ListInboxConversationsHandler,
    private readonly getHandler: GetInboxConversationHandler,
  ) {}

  @Get('conversations')
  async listConversations(
    @Query('channel') channel?: InboxChannel,
    @Query('status') status?: InboxConversationStatus,
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.listHandler.execute(
      new ListInboxConversationsQuery(tenantId, channel, status),
    )
  }

  @Get('conversations/:id')
  async getConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.getHandler.execute(new GetInboxConversationQuery(tenantId, id))
  }

  @Post('messages')
  async sendMessage(
    @Body()
    dto: {
      conversationId?: string
      contactId?: string
      channel: InboxChannel
      recipientIdentifier: string
      subject?: string
      bodyText: string
    },
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.sendHandler.execute(
      new SendInboxMessageCommand(
        tenantId,
        dto.channel,
        dto.recipientIdentifier,
        dto.bodyText,
        dto.conversationId,
        dto.contactId,
        dto.subject,
      ),
    )
  }
}
