import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common'
import {
  CreateConversationHandler,
  AssignConversationHandler,
  ChangeConversationStatusHandler,
  ResolveConversationHandler,
  AddThreadHandler,
} from '../../application/commands/helpdesk.handlers'
import {
  GetConversationHandler,
  ListConversationsHandler,
  ListThreadsHandler,
} from '../../application/queries/helpdesk.handlers'
import {
  CreateConversationCommand,
  AssignConversationCommand,
  ChangeConversationStatusCommand,
  ResolveConversationCommand,
  AddThreadCommand,
} from '../../application/commands/helpdesk.commands'
import {
  GetConversationQuery,
  ListConversationsQuery,
  ListThreadsQuery,
} from '../../application/queries/helpdesk.queries'
import {
  CreateConversationDto,
  AssignConversationDto,
  ChangeConversationStatusDto,
  ResolveConversationDto,
  AddThreadDto,
  ListConversationsQueryDto,
} from './dto/helpdesk.dto'
import { TenantId } from '../../../../common/decorators/tenant-id.decorator'
import { ConversationMapper } from '../../infrastructure/mappers/conversation.mapper'
import { ThreadMapper } from '../../infrastructure/mappers/thread.mapper'

@Controller('conversations')
export class HelpdeskConversationsController {
  constructor(
    private readonly createConversationHandler: CreateConversationHandler,
    private readonly assignConversationHandler: AssignConversationHandler,
    private readonly changeStatusHandler: ChangeConversationStatusHandler,
    private readonly resolveConversationHandler: ResolveConversationHandler,
    private readonly addThreadHandler: AddThreadHandler,
    private readonly getConversationHandler: GetConversationHandler,
    private readonly listConversationsHandler: ListConversationsHandler,
    private readonly listThreadsHandler: ListThreadsHandler,
  ) {}

  @Get()
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

  @Post()
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

  @Get(':id')
  async getConversation(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    const conversation = await this.getConversationHandler.execute(
      new GetConversationQuery(tenantId, id),
    )
    return ConversationMapper.toResponse(conversation)
  }

  @Put(':id/assign')
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

  @Put(':id/status')
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

  @Put(':id/resolve')
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

  @Get(':id/threads')
  async listThreads(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    const threads = await this.listThreadsHandler.execute(
      new ListThreadsQuery(tenantId, id),
    )
    return threads.map(ThreadMapper.toResponse)
  }

  @Post(':id/threads')
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
}
