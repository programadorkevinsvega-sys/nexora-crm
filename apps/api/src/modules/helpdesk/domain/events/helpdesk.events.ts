import { DomainEvent } from '@crm/shared'

export class ConversationCreatedEvent extends DomainEvent {
  readonly aggregateType = 'helpdesk-conversation'
  readonly eventName = 'helpdesk.conversation.created'

  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly mailboxId: string,
    readonly subject: string,
    readonly customerEmail: string,
  ) {
    super()
  }

  toPrimitives() {
    return {
      conversationId: this.aggregateId,
      tenantId: this.tenantId,
      mailboxId: this.mailboxId,
      subject: this.subject,
      customerEmail: this.customerEmail,
    }
  }
}

export class ConversationAssignedEvent extends DomainEvent {
  readonly aggregateType = 'helpdesk-conversation'
  readonly eventName = 'helpdesk.conversation.assigned'

  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly assigneeUserId: string,
  ) {
    super()
  }

  toPrimitives() {
    return {
      conversationId: this.aggregateId,
      tenantId: this.tenantId,
      assigneeUserId: this.assigneeUserId,
    }
  }
}

export class ConversationStatusChangedEvent extends DomainEvent {
  readonly aggregateType = 'helpdesk-conversation'
  readonly eventName = 'helpdesk.conversation.status_changed'

  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly oldStatus: string,
    readonly newStatus: string,
  ) {
    super()
  }

  toPrimitives() {
    return {
      conversationId: this.aggregateId,
      tenantId: this.tenantId,
      oldStatus: this.oldStatus,
      newStatus: this.newStatus,
    }
  }
}

export class ConversationResolvedEvent extends DomainEvent {
  readonly aggregateType = 'helpdesk-conversation'
  readonly eventName = 'helpdesk.conversation.resolved'

  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly resolvedByUserId: string | null,
  ) {
    super()
  }

  toPrimitives() {
    return {
      conversationId: this.aggregateId,
      tenantId: this.tenantId,
      resolvedByUserId: this.resolvedByUserId,
    }
  }
}

export class ThreadAddedEvent extends DomainEvent {
  readonly aggregateType = 'helpdesk-thread'
  readonly eventName = 'helpdesk.thread.added'

  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly conversationId: string,
    readonly threadType: string,
  ) {
    super()
  }

  toPrimitives() {
    return {
      threadId: this.aggregateId,
      tenantId: this.tenantId,
      conversationId: this.conversationId,
      threadType: this.threadType,
    }
  }
}

export class AgentAvailabilityChangedEvent extends DomainEvent {
  readonly aggregateType = 'helpdesk-agent'
  readonly eventName = 'helpdesk.agent.availability_changed'

  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly userId: string,
    readonly isAvailable: boolean,
    readonly agentStatus: string,
  ) {
    super()
  }

  toPrimitives() {
    return {
      agentProfileId: this.aggregateId,
      tenantId: this.tenantId,
      userId: this.userId,
      isAvailable: this.isAvailable,
      agentStatus: this.agentStatus,
    }
  }
}
