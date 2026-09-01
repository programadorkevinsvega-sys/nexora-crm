import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger'
import { HelpdeskBffService, PaginatedResult } from './helpdesk.bff.service'
import type {
  CreateConversation, HelpdeskConversation,
  AddThread, HelpdeskThread,
  CreateMailbox, HelpdeskMailbox,
} from '@crm/contracts'

@ApiTags('Centro de Ayuda & Buzones (Helpdesk)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/helpdesk')
export class HelpdeskBffController {
  constructor(private readonly service: HelpdeskBffService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Listar conversaciones de helpdesk con filtros' })
  @ApiQuery({ name: 'status', required: false, description: 'OPEN, PENDING, RESOLVED, CLOSED' })
  @ApiQuery({ name: 'priority', required: false, description: 'LOW, MEDIUM, HIGH, URGENT' })
  async listConversations(
    @Query('mailboxId') mailboxId?: string,
    @Query('status') status?: string,
    @Query('assigneeUserId') assigneeUserId?: string,
    @Query('priority') priority?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<HelpdeskConversation>> {
    return this.service.listConversations({
      mailboxId,
      status,
      assigneeUserId,
      priority,
      cursor,
      limit: limit ? Number(limit) : undefined,
    }, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Crear una nueva conversación de soporte' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['subject', 'mailboxId'],
      properties: {
        subject: { type: 'string', example: 'Duda sobre integración de Webhooks' },
        mailboxId: { type: 'string', example: '00000000-0000-0000-0000-000000000001' },
        contactId: { type: 'string', example: '00000000-0000-0000-0000-000000000002' },
        priority: { type: 'string', example: 'MEDIUM' },
      },
    },
  })
  async createConversation(
    @Body() dto: CreateConversation,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<HelpdeskConversation> {
    return this.service.createConversation(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Obtener conversación por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la conversación' })
  async getConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<HelpdeskConversation> {
    return this.service.getConversation(id, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Patch('conversations/:id/status')
  @ApiOperation({ summary: 'Cambiar estado de una conversación' })
  @ApiParam({ name: 'id', description: 'UUID de la conversación' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', example: 'RESOLVED' },
      },
    },
  })
  async changeConversationStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { status: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.changeConversationStatus(id, dto.status, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('conversations/:id/threads')
  @ApiOperation({ summary: 'Agregar un mensaje o nota al hilo de la conversación' })
  @ApiParam({ name: 'id', description: 'UUID de la conversación' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['bodyText'],
      properties: {
        bodyText: { type: 'string', example: 'Hemos verificado el webhook y el endpoint respondió 200 OK.' },
        threadType: { type: 'string', example: 'REPLY' },
      },
    },
  })
  async addThread(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddThread,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<HelpdeskThread> {
    return this.service.addThread(id, dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('mailboxes')
  @ApiOperation({ summary: 'Listar buzones de correo entrante (Mailboxes)' })
  async listMailboxes(
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<HelpdeskMailbox[]> {
    return this.service.listMailboxes(tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('mailboxes')
  @ApiOperation({ summary: 'Crear un nuevo buzón de soporte' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'inboundEmail'],
      properties: {
        name: { type: 'string', example: 'Soporte Técnico General' },
        inboundEmail: { type: 'string', example: 'soporte@empresa.com' },
      },
    },
  })
  async createMailbox(
    @Body() dto: CreateMailbox,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<HelpdeskMailbox> {
    return this.service.createMailbox(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }
}
