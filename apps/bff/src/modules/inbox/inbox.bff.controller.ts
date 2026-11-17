import { Controller, Get, Post, Param, Query, Body, Headers, ParseUUIDPipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger'
import { InboxBffService } from './inbox.bff.service'
import { SendInboxMessageSchema } from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import type { InboxConversation, InboxMessage, SendInboxMessage } from '@crm/contracts'

@ApiTags('Bandeja Omnicanal (Omnichannel Inbox)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/inbox')
export class InboxBffController {
  constructor(private readonly service: InboxBffService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Listar conversaciones unificadas de WhatsApp, Email y Redes' })
  @ApiQuery({ name: 'channel', required: false, description: 'WHATSAPP, EMAIL, MESSENGER, INSTAGRAM' })
  @ApiQuery({ name: 'status', required: false, description: 'OPEN, SNOOZED, CLOSED' })
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
  @ApiOperation({ summary: 'Obtener conversación con su historial de mensajes' })
  @ApiParam({ name: 'id', description: 'UUID de la conversación' })
  async getConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<InboxConversation> {
    return this.service.getConversation(id, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('messages')
  @ApiOperation({ summary: 'Enviar un mensaje a un cliente por WhatsApp o Email' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['conversationId', 'channel', 'bodyText'],
      properties: {
        conversationId: { type: 'string', example: '00000000-0000-0000-0000-000000000001' },
        channel: { type: 'string', example: 'WHATSAPP' },
        bodyText: { type: 'string', example: 'Hola, confirmamos la recepción de tu pago. Saludos.' },
      },
    },
  })
  async sendMessage(
    @Body(createZodPipe(SendInboxMessageSchema)) dto: SendInboxMessage,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<InboxMessage> {
    return this.service.sendMessage(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }
}
