import { DomainEvent } from '@crm/shared'

export class TicketCreatedEvent extends DomainEvent {
  readonly aggregateType = 'support-ticket'
  readonly eventName = 'support-ticket.created'

  constructor(
    readonly aggregateId: string,
    readonly subject: string,
    readonly priority: string,
  ) {
    super()
  }

  toPrimitives() {
    return { ticketId: this.aggregateId, subject: this.subject, priority: this.priority }
  }
}

export class TicketStatusChangedEvent extends DomainEvent {
  readonly aggregateType = 'support-ticket'
  readonly eventName = 'support-ticket.status-changed'

  constructor(
    readonly aggregateId: string,
    readonly previousStatus: string,
    readonly newStatus: string,
  ) {
    super()
  }

  toPrimitives() {
    return { ticketId: this.aggregateId, previousStatus: this.previousStatus, newStatus: this.newStatus }
  }
}

export class TicketAssignedEvent extends DomainEvent {
  readonly aggregateType = 'support-ticket'
  readonly eventName = 'support-ticket.assigned'

  constructor(
    readonly aggregateId: string,
    readonly assignedUserId: string,
  ) {
    super()
  }

  toPrimitives() {
    return { ticketId: this.aggregateId, assignedUserId: this.assignedUserId }
  }
}

export class TicketEscalatedEvent extends DomainEvent {
  readonly aggregateType = 'support-ticket'
  readonly eventName = 'support-ticket.escalated'

  constructor(readonly aggregateId: string) {
    super()
  }

  toPrimitives() {
    return { ticketId: this.aggregateId }
  }
}

export class TicketResolvedEvent extends DomainEvent {
  readonly aggregateType = 'support-ticket'
  readonly eventName = 'support-ticket.resolved'

  constructor(readonly aggregateId: string) {
    super()
  }

  toPrimitives() {
    return { ticketId: this.aggregateId }
  }
}

export class ReplyAddedEvent extends DomainEvent {
  readonly aggregateType = 'support-ticket'
  readonly eventName = 'support-ticket.reply-added'

  constructor(
    readonly aggregateId: string,
    readonly replyId: string,
    readonly authorType: string,
  ) {
    super()
  }

  toPrimitives() {
    return { ticketId: this.aggregateId, replyId: this.replyId, authorType: this.authorType }
  }
}
