import { Controller, Get, Post, Param, Query, Body, Headers, ParseUUIDPipe } from '@nestjs/common'
import { InboxBffService } from './inbox.bff.service'
import { SendInboxMessageSchema } from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import type { InboxConversation, InboxMessage, SendInboxMessage } from '@crm/contracts'

@Controller('api/inbox')
export class InboxBffController {
  constructor(private readonly service: InboxBffService) {}

  @Get('conversations')
  async listConversations(
    @Query('channel') channel?: string,
    @Query('status') status?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<InboxConversation[]> {
    return this.service.listConversations(
      channel,
      status,
      tenantId || '00000000-0000-0000-0000-000000000001',
    )
  }

  @Get('conversations/:id')
  async getConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<InboxConversation> {
    return this.service.getConversation(id, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('messages')
  async sendMessage(
    @Body(createZodPipe(SendInboxMessageSchema)) dto: SendInboxMessage,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<InboxMessage> {
    return this.service.sendMessage(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }
}
