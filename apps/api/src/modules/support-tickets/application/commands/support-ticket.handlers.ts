import { Injectable } from '@nestjs/common'
import { TicketRepository } from '../../domain/repositories/ticket.repository'
import { ReplyRepository } from '../../domain/repositories/reply.repository'
import { SupportTicket } from '../../domain/entities/support-ticket.entity'
import { TicketReply } from '../../domain/entities/ticket-reply.entity'
import {
  CreateTicketCommand,
  UpdateTicketStatusCommand,
  AssignTicketCommand,
  AddReplyCommand,
} from './support-ticket.commands'
import {
  TicketCreatedEvent,
  TicketStatusChangedEvent,
  TicketAssignedEvent,
  TicketEscalatedEvent,
  TicketResolvedEvent,
  ReplyAddedEvent,
} from '../../domain/events/support-ticket.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { NotFoundError, ConflictError } from '@crm/shared'

@Injectable()
export class CreateTicketHandler {
  constructor(
    private readonly ticketRepo: TicketRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateTicketCommand): Promise<{ id: string }> {
    const ticket = SupportTicket.create({
      tenantId: command.tenantId,
      subject: command.subject,
      description: command.description,
      contactId: command.contactId,
      priority: command.priority,
      assignedUserId: command.assignedUserId,
      slaId: command.slaId,
    })

    await this.ticketRepo.save(ticket)
    await this.outbox.publish(new TicketCreatedEvent(ticket.id, ticket.subject, ticket.priority))

    return { id: ticket.id }
  }
}

@Injectable()
export class UpdateTicketStatusHandler {
  constructor(
    private readonly ticketRepo: TicketRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UpdateTicketStatusCommand): Promise<void> {
    const ticket = await this.ticketRepo.findById(command.tenantId, command.id)
    if (!ticket) throw new NotFoundError('Ticket', command.id)

    const previousStatus = ticket.status
    const updated = ticket.updateStatus(command.status)
    await this.ticketRepo.save(updated)

    await this.outbox.publish(new TicketStatusChangedEvent(updated.id, previousStatus, command.status))

    if (command.status === 'RESOLVED') {
      await this.outbox.publish(new TicketResolvedEvent(updated.id))
    }
  }
}

@Injectable()
export class AssignTicketHandler {
  constructor(
    private readonly ticketRepo: TicketRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: AssignTicketCommand): Promise<void> {
    const ticket = await this.ticketRepo.findById(command.tenantId, command.id)
    if (!ticket) throw new NotFoundError('Ticket', command.id)

    const updated = ticket.assign(command.assignedUserId)
    await this.ticketRepo.save(updated)
    await this.outbox.publish(new TicketAssignedEvent(updated.id, command.assignedUserId))
  }
}

@Injectable()
export class AddReplyHandler {
  constructor(
    private readonly ticketRepo: TicketRepository,
    private readonly replyRepo: ReplyRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: AddReplyCommand): Promise<{ id: string }> {
    const ticket = await this.ticketRepo.findById(command.tenantId, command.ticketId)
    if (!ticket) throw new NotFoundError('Ticket', command.ticketId)

    const reply = TicketReply.create({
      tenantId: command.tenantId,
      ticketId: command.ticketId,
      authorType: command.authorType,
      authorId: command.authorId,
      message: command.message,
      isInternalNote: command.isInternalNote,
    })

    await this.replyRepo.save(reply)

    const updatedTicket = ticket.updateStatus('PENDING')
    await this.ticketRepo.save(updatedTicket)

    await this.outbox.publish(new ReplyAddedEvent(ticket.id, reply.id, reply.authorType))

    return { id: reply.id }
  }
}
