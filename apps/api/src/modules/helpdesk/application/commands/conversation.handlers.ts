import { Injectable } from '@nestjs/common'
import { ConversationRepository } from '../../domain/repositories/conversation.repository'
import { ThreadRepository } from '../../domain/repositories/thread.repository'
import { HelpdeskConversation } from '../../domain/entities/conversation.entity'
import { HelpdeskThread } from '../../domain/entities/thread.entity'
import {
  ConversationCreatedEvent,
  ConversationAssignedEvent,
  ConversationStatusChangedEvent,
  ConversationResolvedEvent,
  ThreadAddedEvent,
} from '../../domain/events/helpdesk.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { NotFoundError } from '@crm/shared'
import {
  CreateConversationCommand,
  AssignConversationCommand,
  ChangeConversationStatusCommand,
  ResolveConversationCommand,
  AddThreadCommand,
} from './helpdesk.commands'

@Injectable()
export class CreateConversationHandler {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateConversationCommand): Promise<{ id: string }> {
    const conversation = HelpdeskConversation.create({
      tenantId: command.tenantId,
      mailboxId: command.mailboxId,
      subject: command.subject,
      customerEmail: command.customerEmail,
      customerId: command.customerId,
      assigneeUserId: command.assigneeUserId,
      status: command.status,
      priority: command.priority,
      sourceChannel: command.sourceChannel,
      previewText: command.previewText,
      estimatedHours: command.estimatedHours,
      dueDate: command.dueDate,
      isInternal: command.isInternal,
      requiresApproval: command.requiresApproval,
    })

    await this.conversationRepo.save(conversation)
    await this.outbox.publish(
      new ConversationCreatedEvent(
        conversation.id,
        conversation.tenantId,
        conversation.mailboxId,
        conversation.subject,
        conversation.customerEmail,
      ),
    )

    return { id: conversation.id }
  }
}

@Injectable()
export class AssignConversationHandler {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: AssignConversationCommand): Promise<void> {
    const conversation = await this.conversationRepo.findById(command.tenantId, command.conversationId)
    if (!conversation) throw new NotFoundError('Conversation', command.conversationId)

    const updated = conversation.assign(command.assigneeUserId)
    await this.conversationRepo.save(updated)
    await this.outbox.publish(
      new ConversationAssignedEvent(updated.id, updated.tenantId, command.assigneeUserId),
    )
  }
}

@Injectable()
export class ChangeConversationStatusHandler {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: ChangeConversationStatusCommand): Promise<void> {
    const conversation = await this.conversationRepo.findById(command.tenantId, command.conversationId)
    if (!conversation) throw new NotFoundError('Conversation', command.conversationId)

    const oldStatus = conversation.status
    const updated = conversation.changeStatus(command.status)
    await this.conversationRepo.save(updated)
    await this.outbox.publish(
      new ConversationStatusChangedEvent(updated.id, updated.tenantId, oldStatus, command.status),
    )
  }
}

@Injectable()
export class ResolveConversationHandler {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: ResolveConversationCommand): Promise<void> {
    const conversation = await this.conversationRepo.findById(command.tenantId, command.conversationId)
    if (!conversation) throw new NotFoundError('Conversation', command.conversationId)

    const updated = conversation.resolve()
    await this.conversationRepo.save(updated)
    await this.outbox.publish(
      new ConversationResolvedEvent(updated.id, updated.tenantId, command.resolvedByUserId),
    )
  }
}

@Injectable()
export class AddThreadHandler {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly threadRepo: ThreadRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: AddThreadCommand): Promise<{ id: string }> {
    const conversation = await this.conversationRepo.findById(command.tenantId, command.conversationId)
    if (!conversation) throw new NotFoundError('Conversation', command.conversationId)

    const thread = HelpdeskThread.create({
      tenantId: command.tenantId,
      conversationId: command.conversationId,
      threadType: command.threadType,
      bodyHtml: command.bodyHtml,
      bodyText: command.bodyText,
      createdByUserId: command.createdByUserId,
      createdByCustomerId: command.createdByCustomerId,
      isDraft: command.isDraft,
      messageIdHeader: command.messageIdHeader,
      toAddresses: command.toAddresses,
      ccAddresses: command.ccAddresses,
    })

    const updatedConversation = conversation.addThread({
      previewText: command.bodyText?.substring(0, 255) ?? undefined,
      hasAttachments: false,
      lastReplyAt: new Date(),
      lastReplyFrom: command.createdByUserId ? 'AGENT' : command.createdByCustomerId ? 'CUSTOMER' : undefined,
    })

    await this.threadRepo.save(thread)
    await this.conversationRepo.save(updatedConversation)
    await this.outbox.publish(
      new ThreadAddedEvent(thread.id, thread.tenantId, thread.conversationId, thread.threadType),
    )

    return { id: thread.id }
  }
}
