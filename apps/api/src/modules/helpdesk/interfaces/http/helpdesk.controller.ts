import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common'
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
import {
  CreateConversationDto,
  AssignConversationDto,
  ChangeConversationStatusDto,
  ResolveConversationDto,
  AddThreadDto,
  CreateMailboxDto,
  ListConversationsQueryDto,
} from './dto/helpdesk.dto'
import { TenantId } from '../../../../common/decorators/tenant-id.decorator'
import { ConversationMapper } from '../../infrastructure/mappers/conversation.mapper'
import { ThreadMapper } from '../../infrastructure/mappers/thread.mapper'
import { MailboxMapper } from '../../infrastructure/mappers/mailbox.mapper'
import { AgentProfileMapper } from '../../infrastructure/mappers/agent-profile.mapper'

@Controller()
export class HelpdeskController {
  constructor(
    private readonly createConversationHandler: CreateConversationHandler,
    private readonly assignConversationHandler: AssignConversationHandler,
    private readonly changeStatusHandler: ChangeConversationStatusHandler,
    private readonly resolveConversationHandler: ResolveConversationHandler,
    private readonly addThreadHandler: AddThreadHandler,
    private readonly updateAgentAvailabilityHandler: UpdateAgentAvailabilityHandler,
    private readonly createMailboxHandler: CreateMailboxHandler,
    private readonly getConversationHandler: GetConversationHandler,
    private readonly listConversationsHandler: ListConversationsHandler,
    private readonly listThreadsHandler: ListThreadsHandler,
    private readonly getAgentProfileHandler: GetAgentProfileHandler,
    private readonly listMailboxesHandler: ListMailboxesHandler,
  ) {}

  @Get('conversations')
  async listConversations(
    @Query() queryDto: ListConversationsQueryDto,
    @TenantId() tenantId: string,
  ) {
    const result = await this.listConversationsHandler.execute(
      new ListConversationsQuery(tenantId, {
        mailboxId: queryDto.mailboxId,
        status: queryDto.status,
        assigneeUserId: queryDto.assigneeUserId,
        priority: queryDto.priority,
        search: queryDto.search,
        cursor: queryDto.cursor,
        limit: Math.min(queryDto.limit || 20, 100),
      }),
    )
    return {
      data: result.data.map(ConversationMapper.toResponse),
      nextCursor: result.nextCursor,
    }
  }

  @Post('conversations')
  async createConversation(
    @Body() dto: CreateConversationDto,
    @TenantId() tenantId: string,
  ) {
    const result = await this.createConversationHandler.execute(
      new CreateConversationCommand(
        tenantId,
        dto.mailboxId,
        dto.subject,
        dto.customerEmail,
        dto.customerId,
        dto.assigneeUserId,
        dto.status,
        dto.priority,
        dto.sourceChannel,
        dto.previewText,
        dto.estimatedHours,
        dto.dueDate ? new Date(dto.dueDate) : undefined,
        dto.isInternal,
        dto.requiresApproval,
      ),
    )
    return result
  }

  @Get('conversations/:id')
  async getConversation(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    const conversation = await this.getConversationHandler.execute(
      new GetConversationQuery(tenantId, id),
    )
    return ConversationMapper.toResponse(conversation)
  }

  @Put('conversations/:id/assign')
  async assignConversation(
    @Param('id') id: string,
    @Body() dto: AssignConversationDto,
    @TenantId() tenantId: string,
  ) {
    await this.assignConversationHandler.execute(
      new AssignConversationCommand(tenantId, id, dto.assigneeUserId),
    )
    return { id }
  }

  @Put('conversations/:id/status')
  async changeConversationStatus(
    @Param('id') id: string,
    @Body() dto: ChangeConversationStatusDto,
    @TenantId() tenantId: string,
  ) {
    await this.changeStatusHandler.execute(
      new ChangeConversationStatusCommand(tenantId, id, dto.status),
    )
    return { id }
  }

  @Put('conversations/:id/resolve')
  async resolveConversation(
    @Param('id') id: string,
    @Body() dto: ResolveConversationDto,
    @TenantId() tenantId: string,
  ) {
    await this.resolveConversationHandler.execute(
      new ResolveConversationCommand(tenantId, id, dto.resolvedByUserId ?? null),
    )
    return { id }
  }

  @Get('conversations/:id/threads')
  async listThreads(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    const threads = await this.listThreadsHandler.execute(
      new ListThreadsQuery(tenantId, id),
    )
    return threads.map(ThreadMapper.toResponse)
  }

  @Post('conversations/:id/threads')
  async addThread(
    @Param('id') id: string,
    @Body() dto: AddThreadDto,
    @TenantId() tenantId: string,
  ) {
    const result = await this.addThreadHandler.execute(
      new AddThreadCommand(
        tenantId,
        id,
        dto.threadType,
        dto.bodyHtml,
        dto.bodyText,
        dto.createdByUserId,
        dto.createdByCustomerId,
        dto.isDraft,
        dto.messageIdHeader,
        dto.toAddresses,
        dto.ccAddresses,
      ),
    )
    return result
  }

  @Get('mailboxes')
  async listMailboxes(@TenantId() tenantId: string) {
    const mailboxes = await this.listMailboxesHandler.execute(
      new ListMailboxesQuery(tenantId),
    )
    return mailboxes.map(MailboxMapper.toResponse)
  }

  @Post('mailboxes')
  async createMailbox(
    @Body() dto: CreateMailboxDto,
    @TenantId() tenantId: string,
  ) {
    const result = await this.createMailboxHandler.execute(
      new CreateMailboxCommand(tenantId, dto.name, dto.emailAddress, dto.isActive),
    )
    return result
  }

  @Get('agents/:userId')
  async getAgentProfile(
    @Param('userId') userId: string,
    @TenantId() tenantId: string,
  ) {
    const profile = await this.getAgentProfileHandler.execute(
      new GetAgentProfileQuery(tenantId, userId),
    )
    return AgentProfileMapper.toResponse(profile)
  }
}
