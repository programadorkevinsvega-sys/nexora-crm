import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Param,
  Query,
  Body,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common'
import { z } from 'zod'
import {
  CreateTicketSchema,
  UpdateTicketStatusSchema,
} from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { SupportTicketsBffService, TicketFilters, PaginatedResult } from './support-tickets.bff.service'
import type { CreateTicket, SupportTicket, TicketReply } from '@crm/contracts'

const AssignTicketBodySchema = z.object({
  assignedUserId: z.string().uuid(),
})

@Controller('api')
export class SupportTicketsBffController {
  constructor(private readonly service: SupportTicketsBffService) {}

  @Get('tickets')
  async list(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assignedUserId') assignedUserId?: string,
    @Query('contactId') contactId?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<SupportTicket>> {
    const filters: TicketFilters = {
      cursor,
      limit: limit ? Number(limit) : undefined,
      status,
      priority,
      assignedUserId,
      contactId,
    }
    return this.service.list(filters, tenantId!)
  }

  @Post('tickets')
  async create(
    @Body(createZodPipe(CreateTicketSchema)) dto: CreateTicket,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SupportTicket> {
    return this.service.create(dto, tenantId!)
  }

  @Get('tickets/:id')
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SupportTicket> {
    return this.service.getById(id, tenantId!)
  }

  @Put('tickets/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { status?: string; assignedUserId?: string; subject?: string; description?: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SupportTicket> {
    if (dto.status) {
      await this.service.updateStatus(id, dto.status, tenantId!)
    }
    if (dto.assignedUserId) {
      await this.service.assign(id, dto.assignedUserId, tenantId!)
    }
    return this.service.getById(id, tenantId!)
  }

  @Patch('tickets/:id')
  async patch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { status?: string; assignedUserId?: string; subject?: string; description?: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SupportTicket> {
    return this.update(id, dto, tenantId)
  }

  @Patch('tickets/:id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(UpdateTicketStatusSchema)) dto: { status: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SupportTicket> {
    return this.service.updateStatus(id, dto.status, tenantId!)
  }

  @Patch('tickets/:id/assign')
  async assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(AssignTicketBodySchema)) dto: { assignedUserId: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SupportTicket> {
    return this.service.assign(id, dto.assignedUserId, tenantId!)
  }

  @Post('tickets/:id/replies')
  async addReply(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
    @Headers('X-Tenant-Id') tenantId?: string,
    @Headers('X-User-Id') userId?: string,
  ): Promise<TicketReply> {
    const authorId = body.authorId || userId || '00000000-0000-0000-0000-000000000002'
    const authorType = body.authorType || 'AGENT'
    return this.service.addReply(
      id,
      {
        message: body.message,
        authorType,
        authorId,
        isInternalNote: Boolean(body.isInternalNote),
      },
      tenantId!,
    )
  }

  @Get('tickets/:id/replies')
  async listReplies(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ data: TicketReply[]; nextCursor: null }> {
    const replies = await this.service.listReplies(id, tenantId!)
    return { data: replies, nextCursor: null }
  }
}
