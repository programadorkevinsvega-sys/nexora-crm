import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateConversationHandler,
  AssignConversationHandler,
  ChangeConversationStatusHandler,
  ResolveConversationHandler,
  AddThreadHandler,
  UpdateAgentAvailabilityHandler,
  CreateMailboxHandler,
} from '../../application/commands/helpdesk.handlers'
import {
  GetConversationHandler,
  ListConversationsHandler,
  ListThreadsHandler,
  GetAgentProfileHandler,
  ListMailboxesHandler,
} from '../../application/queries/helpdesk.handlers'
import {
  CreateConversationCommand,
  AssignConversationCommand,
  ChangeConversationStatusCommand,
  ResolveConversationCommand,
  AddThreadCommand,
  UpdateAgentAvailabilityCommand,
  CreateMailboxCommand,
} from '../../application/commands/helpdesk.commands'
import {
  GetConversationQuery,
  ListConversationsQuery,
  ListThreadsQuery,
  GetAgentProfileQuery,
  ListMailboxesQuery,
} from '../../application/queries/helpdesk.queries'
import { ConversationMapper } from '../../infrastructure/mappers/conversation.mapper'
import { ThreadMapper } from '../../infrastructure/mappers/thread.mapper'
import { MailboxMapper } from '../../infrastructure/mappers/mailbox.mapper'
import { AgentProfileMapper } from '../../infrastructure/mappers/agent-profile.mapper'

@Controller()
export class HelpdeskGrpcController {
  constructor(
    private readonly createConversationHandler: CreateConversationHandler,
    private readonly getConversationHandler: GetConversationHandler,
    private readonly listConversationsHandler: ListConversationsHandler,
    private readonly assignConversationHandler: AssignConversationHandler,
    private readonly changeStatusHandler: ChangeConversationStatusHandler,
    private readonly resolveConversationHandler: ResolveConversationHandler,
    private readonly listThreadsHandler: ListThreadsHandler,
    private readonly addThreadHandler: AddThreadHandler,
    private readonly listMailboxesHandler: ListMailboxesHandler,
    private readonly createMailboxHandler: CreateMailboxHandler,
    private readonly getAgentProfileHandler: GetAgentProfileHandler,
    private readonly updateAgentAvailabilityHandler: UpdateAgentAvailabilityHandler,
  ) {}

  @GrpcMethod('HelpdeskService', 'CreateConversation')
  async createConversation(data: {
    tenantId: string
    mailboxId: string
    subject: string
    customerEmail: string
    customerId?: string
    assigneeUserId?: string
    status?: string
    priority?: string
    sourceChannel?: string
    previewText?: string
    estimatedHours?: number
    dueDate?: string
    isInternal?: boolean
    requiresApproval?: boolean
  }) {
    const result = await this.createConversationHandler.execute(
      new CreateConversationCommand(
        data.tenantId, data.mailboxId, data.subject, data.customerEmail,
        data.customerId, data.assigneeUserId, data.status, data.priority,
        data.sourceChannel, data.previewText, data.estimatedHours,
        data.dueDate ? new Date(data.dueDate) : undefined,
        data.isInternal, data.requiresApproval,
      ),
    )
    const conversation = await this.getConversationHandler.execute(
      new GetConversationQuery(data.tenantId, result.id),
    )
    return { json: JSON.stringify(ConversationMapper.toResponse(conversation)) }
  }

  @GrpcMethod('HelpdeskService', 'GetConversation')
  async getConversation(data: { tenantId: string; id: string }) {
    const conversation = await this.getConversationHandler.execute(
      new GetConversationQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(ConversationMapper.toResponse(conversation)) }
  }

  @GrpcMethod('HelpdeskService', 'ListConversations')
  async listConversations(data: {
    tenantId: string
    mailboxId?: string
    status?: string
    assigneeUserId?: string
    priority?: string
    search?: string
    cursor?: string
    limit?: number
  }) {
    const result = await this.listConversationsHandler.execute(
      new ListConversationsQuery(data.tenantId, {
        mailboxId: data.mailboxId,
        status: data.status,
        assigneeUserId: data.assigneeUserId,
        priority: data.priority,
        search: data.search,
        cursor: data.cursor,
        limit: Math.min(data.limit || 20, 100),
      }),
    )
    return {
      jsonItems: result.data.map(c => JSON.stringify(ConversationMapper.toResponse(c))),
      nextCursor: result.nextCursor ?? undefined,
    }
  }

  @GrpcMethod('HelpdeskService', 'AssignConversation')
  async assignConversation(data: { tenantId: string; conversationId: string; assigneeUserId: string }) {
    await this.assignConversationHandler.execute(
      new AssignConversationCommand(data.tenantId, data.conversationId, data.assigneeUserId),
    )
    return {}
  }

  @GrpcMethod('HelpdeskService', 'ChangeConversationStatus')
  async changeConversationStatus(data: { tenantId: string; conversationId: string; status: string }) {
    await this.changeStatusHandler.execute(
      new ChangeConversationStatusCommand(data.tenantId, data.conversationId, data.status),
    )
    return {}
  }

  @GrpcMethod('HelpdeskService', 'ResolveConversation')
  async resolveConversation(data: { tenantId: string; conversationId: string; resolvedByUserId?: string }) {
    await this.resolveConversationHandler.execute(
      new ResolveConversationCommand(data.tenantId, data.conversationId, data.resolvedByUserId ?? null),
    )
    return {}
  }

  @GrpcMethod('HelpdeskService', 'ListThreads')
  async listThreads(data: { tenantId: string; conversationId: string }) {
    const threads = await this.listThreadsHandler.execute(
      new ListThreadsQuery(data.tenantId, data.conversationId),
    )
    return {
      jsonItems: threads.map(t => JSON.stringify(ThreadMapper.toResponse(t))),
    }
  }

  @GrpcMethod('HelpdeskService', 'AddThread')
  async addThread(data: {
    tenantId: string
    conversationId: string
    threadType: string
    bodyHtml?: string
    bodyText?: string
    createdByUserId?: string
    createdByCustomerId?: string
    isDraft?: boolean
    messageIdHeader?: string
    toAddresses?: string
    ccAddresses?: string
  }) {
    const result = await this.addThreadHandler.execute(
      new AddThreadCommand(
        data.tenantId, data.conversationId, data.threadType,
        data.bodyHtml, data.bodyText, data.createdByUserId,
        data.createdByCustomerId, data.isDraft, data.messageIdHeader,
        data.toAddresses, data.ccAddresses,
      ),
    )
    return { id: result.id }
  }

  @GrpcMethod('HelpdeskService', 'ListMailboxes')
  async listMailboxes(data: { tenantId: string }) {
    const mailboxes = await this.listMailboxesHandler.execute(
      new ListMailboxesQuery(data.tenantId),
    )
    return {
      jsonItems: mailboxes.map(m => JSON.stringify(MailboxMapper.toResponse(m))),
    }
  }

  @GrpcMethod('HelpdeskService', 'CreateMailbox')
  async createMailbox(data: {
    tenantId: string
    name: string
    emailAddress: string
    isActive?: boolean
  }) {
    const result = await this.createMailboxHandler.execute(
      new CreateMailboxCommand(data.tenantId, data.name, data.emailAddress, data.isActive),
    )
    return { id: result.id }
  }

  @GrpcMethod('HelpdeskService', 'GetAgentProfile')
  async getAgentProfile(data: { tenantId: string; userId: string }) {
    const profile = await this.getAgentProfileHandler.execute(
      new GetAgentProfileQuery(data.tenantId, data.userId),
    )
    return { json: JSON.stringify(AgentProfileMapper.toResponse(profile)) }
  }

  @GrpcMethod('HelpdeskService', 'UpdateAgentAvailability')
  async updateAgentAvailability(data: {
    tenantId: string
    userId: string
    isAvailable: boolean
    agentStatus?: string
  }) {
    await this.updateAgentAvailabilityHandler.execute(
      new UpdateAgentAvailabilityCommand(data.tenantId, data.userId, data.isAvailable, data.agentStatus),
    )
    return {}
  }
}
