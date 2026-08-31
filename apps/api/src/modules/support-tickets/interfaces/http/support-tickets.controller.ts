import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common'
import { CreateTicketHandler, UpdateTicketStatusHandler, AssignTicketHandler, AddReplyHandler } from '../../application/commands/support-ticket.handlers'
import { GetTicketHandler, ListTicketsHandler, GetTicketRepliesHandler } from '../../application/queries/support-ticket.handlers'
import { CreateTicketCommand, UpdateTicketStatusCommand, AssignTicketCommand, AddReplyCommand } from '../../application/commands/support-ticket.commands'
import { GetTicketQuery, ListTicketsQuery, GetTicketRepliesQuery } from '../../application/queries/support-ticket.queries'
import { CreateTicketDto, UpdateTicketStatusDto, AssignTicketDto, AddReplyDto } from './dto/support-ticket.dto'
import { TenantId } from '../../../../common/decorators/tenant-id.decorator'
import { SupportTicketMapper } from '../../infrastructure/support-ticket.mapper'

@Controller('support-tickets')
export class SupportTicketsController {
  constructor(
    private readonly createHandler: CreateTicketHandler,
    private readonly updateStatusHandler: UpdateTicketStatusHandler,
    private readonly assignHandler: AssignTicketHandler,
    private readonly addReplyHandler: AddReplyHandler,
    private readonly getHandler: GetTicketHandler,
    private readonly listHandler: ListTicketsHandler,
    private readonly getRepliesHandler: GetTicketRepliesHandler,
  ) {}

  @Post()
  async create(@Body() dto: CreateTicketDto, @TenantId() tenantId: string) {
    const result = await this.createHandler.execute(
      new CreateTicketCommand(tenantId, dto.subject, dto.description, dto.contactId, dto.priority, dto.assignedUserId, dto.slaId),
    )
    return result
  }

  @Get()
  async list(
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @Query('search') search: string | undefined,
    @Query('status') status: string | undefined,
    @Query('priority') priority: string | undefined,
    @Query('assignedUserId') assignedUserId: string | undefined,
    @Query('contactId') contactId: string | undefined,
    @TenantId() tenantId: string,
  ) {
    const result = await this.listHandler.execute(
      new ListTicketsQuery(tenantId, {
        status: status as any,
        priority: priority as any,
        assignedUserId,
        contactId,
        search,
        cursor,
        limit: Math.min(Number(limit) || 20, 100),
      }),
    )
    return {
      data: result.data.map(SupportTicketMapper.toResponse),
      nextCursor: result.nextCursor,
    }
  }

  @Get(':id')
  async get(@Param('id') id: string, @TenantId() tenantId: string) {
    const { ticket, replies } = await this.getHandler.execute(new GetTicketQuery(tenantId, id))
    return {
      ticket: SupportTicketMapper.toResponse(ticket),
      replies: replies.map(SupportTicketMapper.replyToResponse),
    }
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateTicketStatusDto, @TenantId() tenantId: string) {
    await this.updateStatusHandler.execute(new UpdateTicketStatusCommand(tenantId, id, dto.status))
    return { id }
  }

  @Put(':id/assign')
  async assign(@Param('id') id: string, @Body() dto: AssignTicketDto, @TenantId() tenantId: string) {
    await this.assignHandler.execute(new AssignTicketCommand(tenantId, id, dto.assignedUserId))
    return { id }
  }

  @Post(':id/replies')
  async addReply(@Param('id') id: string, @Body() dto: AddReplyDto, @TenantId() tenantId: string) {
    const result = await this.addReplyHandler.execute(
      new AddReplyCommand(tenantId, id, dto.authorType, dto.authorId, dto.message, dto.isInternalNote),
    )
    return result
  }

  @Get(':id/replies')
  async listReplies(@Param('id') id: string, @TenantId() tenantId: string) {
    const replies = await this.getRepliesHandler.execute(new GetTicketRepliesQuery(tenantId, id))
    return replies.map(SupportTicketMapper.replyToResponse)
  }
}
