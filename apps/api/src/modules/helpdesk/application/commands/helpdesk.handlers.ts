import { Injectable } from '@nestjs/common'
import { ConversationRepository } from '../../domain/repositories/conversation.repository'
import { ThreadRepository } from '../../domain/repositories/thread.repository'
import { AgentRepository } from '../../domain/repositories/agent.repository'
import { MailboxRepository } from '../../domain/repositories/mailbox.repository'
import { HelpdeskConversation } from '../../domain/entities/conversation.entity'
import { HelpdeskThread } from '../../domain/entities/thread.entity'
import { AgentProfile } from '../../domain/entities/agent-profile.entity'
import { HelpdeskMailbox } from '../../domain/entities/mailbox.entity'
import {
  ConversationCreatedEvent,
  ConversationAssignedEvent,
  ConversationStatusChangedEvent,
  ConversationResolvedEvent,
  ThreadAddedEvent,
  AgentAvailabilityChangedEvent,
} from '../../domain/events/helpdesk.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { NotFoundError, ConflictError } from '@crm/shared'
import {
  CreateConversationCommand,
  AssignConversationCommand,
  ChangeConversationStatusCommand,
  ResolveConversationCommand,
  AddThreadCommand,
  UpdateAgentAvailabilityCommand,
  CreateMailboxCommand,
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

@Injectable()
export class UpdateAgentAvailabilityHandler {
  constructor(
    private readonly agentRepo: AgentRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UpdateAgentAvailabilityCommand): Promise<void> {
    let profile = await this.agentRepo.findByUserId(command.tenantId, command.userId)

    if (!profile) {
      profile = AgentProfile.create({
        tenantId: command.tenantId,
        userId: command.userId,
        isAvailable: command.isAvailable,
        agentStatus: command.agentStatus,
      })
    } else {
      profile = profile.updateAvailability(command.isAvailable, command.agentStatus)
    }

    await this.agentRepo.save(profile)
    await this.outbox.publish(
      new AgentAvailabilityChangedEvent(
        profile.id,
        profile.tenantId,
        profile.userId,
        profile.isAvailable,
        profile.agentStatus,
      ),
    )
  }
}

@Injectable()
export class CreateMailboxHandler {
  constructor(
    private readonly mailboxRepo: MailboxRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateMailboxCommand): Promise<{ id: string }> {
    const mailbox = HelpdeskMailbox.create({
      tenantId: command.tenantId,
      name: command.name,
      emailAddress: command.emailAddress,
      isActive: command.isActive,
    })

    await this.mailboxRepo.save(mailbox)
    return { id: mailbox.id }
  }
}
