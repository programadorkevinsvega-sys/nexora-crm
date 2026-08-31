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
import { HelpdeskBffService, PaginatedResult } from './helpdesk.bff.service'
import type {
  CreateConversation, HelpdeskConversation,
  AddThread, HelpdeskThread,
  CreateMailbox, HelpdeskMailbox,
} from '@crm/contracts'

@Controller('api/helpdesk')
export class HelpdeskBffController {
  constructor(private readonly service: HelpdeskBffService) {}

  @Get('conversations')
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
    }, tenantId!)
  }

  @Post('conversations')
  async createConversation(
    @Body() dto: CreateConversation,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<HelpdeskConversation> {
    return this.service.createConversation(dto, tenantId!)
  }

  @Get('conversations/:id')
  async getConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<HelpdeskConversation> {
    return this.service.getConversation(id, tenantId!)
  }

  @Patch('conversations/:id/status')
  async changeConversationStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { status: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.changeConversationStatus(id, dto.status, tenantId!)
  }

  @Patch('conversations/:id/assign')
  async assignConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { assigneeUserId: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.assignConversation(id, dto.assigneeUserId, tenantId!)
  }

  @Post('conversations/:id/resolve')
  async resolveConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.resolveConversation(id, tenantId!)
  }

  @Get('conversations/:id/threads')
  async listThreads(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<HelpdeskThread>> {
    return this.service.listThreads(id, tenantId!)
  }

  @Post('conversations/:id/threads')
  async addThread(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddThread,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<HelpdeskThread> {
    return this.service.addThread(id, dto, tenantId!)
  }

  @Get('mailboxes')
  async listMailboxes(
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<HelpdeskMailbox[]> {
    return this.service.listMailboxes(tenantId!)
  }

  @Post('mailboxes')
  async createMailbox(
    @Body() dto: CreateMailbox,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<HelpdeskMailbox> {
    return this.service.createMailbox(dto, tenantId!)
  }

  @Get('agents/profile')
  async getAgentProfile(
    @Headers('X-User-Id') userId?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Record<string, unknown>> {
    return this.service.getAgentProfile(userId!, tenantId!)
  }

  @Patch('agents/availability')
  async updateAgentAvailability(
    @Body() dto: { isAvailable: boolean; agentStatus?: string },
    @Headers('X-User-Id') userId?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.updateAgentAvailability(dto, userId!, tenantId!)
  }
}
