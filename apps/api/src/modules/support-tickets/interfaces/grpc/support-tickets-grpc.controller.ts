import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { CreateTicketHandler, UpdateTicketStatusHandler, AssignTicketHandler, AddReplyHandler } from '../../application/commands/support-ticket.handlers'
import { GetTicketHandler, ListTicketsHandler, GetTicketRepliesHandler } from '../../application/queries/support-ticket.handlers'
import { CreateTicketCommand, UpdateTicketStatusCommand, AssignTicketCommand, AddReplyCommand } from '../../application/commands/support-ticket.commands'
import { GetTicketQuery, ListTicketsQuery, GetTicketRepliesQuery } from '../../application/queries/support-ticket.queries'
import { SupportTicketMapper } from '../../infrastructure/support-ticket.mapper'
import { TicketPriority, TicketStatus } from '../../domain/entities/support-ticket.entity'
import { AuthorType } from '../../domain/entities/ticket-reply.entity'

@Controller()
export class SupportTicketsGrpcController {
  constructor(
    private readonly createHandler: CreateTicketHandler,
    private readonly updateStatusHandler: UpdateTicketStatusHandler,
    private readonly assignHandler: AssignTicketHandler,
    private readonly addReplyHandler: AddReplyHandler,
    private readonly getHandler: GetTicketHandler,
    private readonly listHandler: ListTicketsHandler,
    private readonly getRepliesHandler: GetTicketRepliesHandler,
  ) {}

  @GrpcMethod('SupportTicketService', 'CreateTicket')
  async create(data: {
    tenantId: string
    subject: string
    description: string
    contactId?: string
    priority?: string
    assignedUserId?: string
    slaId?: string
  }) {
    const result = await this.createHandler.execute(
      new CreateTicketCommand(
        data.tenantId, data.subject, data.description,
        data.contactId, data.priority as TicketPriority,
        data.assignedUserId, data.slaId,
      ),
    )
    const ticket = await this.getHandler.execute(
      new GetTicketQuery(data.tenantId, result.id),
    )
    return { json: JSON.stringify(SupportTicketMapper.toResponse(ticket.ticket)) }
  }

  @GrpcMethod('SupportTicketService', 'GetTicket')
  async getById(data: { tenantId: string; id: string }) {
    const { ticket, replies } = await this.getHandler.execute(
      new GetTicketQuery(data.tenantId, data.id),
    )
    return {
      json: JSON.stringify(SupportTicketMapper.toResponse(ticket)),
      replies: replies.map(r => JSON.stringify(SupportTicketMapper.replyToResponse(r))),
    }
  }

  @GrpcMethod('SupportTicketService', 'ListTickets')
  async list(data: {
    tenantId: string
    cursor?: string
    limit?: number
    status?: string
    priority?: string
    assignedUserId?: string
    contactId?: string
    search?: string
  }) {
    const result = await this.listHandler.execute(
      new ListTicketsQuery(data.tenantId, {
        status: data.status as TicketStatus,
        priority: data.priority as TicketPriority,
        assignedUserId: data.assignedUserId,
        contactId: data.contactId,
        search: data.search,
        cursor: data.cursor,
        limit: Math.min(data.limit || 20, 100),
      }),
    )
    return {
      jsonItems: result.data.map(t => JSON.stringify(SupportTicketMapper.toResponse(t))),
      nextCursor: result.nextCursor ?? undefined,
    }
  }

  @GrpcMethod('SupportTicketService', 'UpdateTicketStatus')
  async updateStatus(data: {
    tenantId: string
    id: string
    status: string
  }) {
    await this.updateStatusHandler.execute(
      new UpdateTicketStatusCommand(data.tenantId, data.id, data.status as TicketStatus),
    )
    return {}
  }

  @GrpcMethod('SupportTicketService', 'AssignTicket')
  async assign(data: {
    tenantId: string
    id: string
    assignedUserId: string
  }) {
    await this.assignHandler.execute(
      new AssignTicketCommand(data.tenantId, data.id, data.assignedUserId),
    )
    return {}
  }

  @GrpcMethod('SupportTicketService', 'AddTicketReply')
  async addReply(data: {
    tenantId: string
    ticketId: string
    authorType: string
    authorId: string
    message: string
    isInternalNote?: boolean
  }) {
    const result = await this.addReplyHandler.execute(
      new AddReplyCommand(
        data.tenantId, data.ticketId,
        data.authorType as AuthorType, data.authorId,
        data.message, data.isInternalNote,
      ),
    )
    const replies = await this.getRepliesHandler.execute(
      new GetTicketRepliesQuery(data.tenantId, data.ticketId),
    )
    const replyObj = replies.find(r => r.id === result.id) || replies[replies.length - 1]
    return {
      id: result.id,
      json: JSON.stringify(
        replyObj
          ? SupportTicketMapper.replyToResponse(replyObj)
          : { id: result.id, message: data.message, authorType: data.authorType, authorId: data.authorId, createdAt: new Date().toISOString() },
      ),
      replies: replies.map(r => JSON.stringify(SupportTicketMapper.replyToResponse(r))),
    }
  }

  @GrpcMethod('SupportTicketService', 'GetTicketReplies')
  async getReplies(data: { tenantId: string; ticketId?: string; id?: string }) {
    const ticketId = data.ticketId || data.id!
    const replies = await this.getRepliesHandler.execute(
      new GetTicketRepliesQuery(data.tenantId, ticketId),
    )
    return {
      jsonItems: replies.map(r => JSON.stringify(SupportTicketMapper.replyToResponse(r))),
    }
  }
}
