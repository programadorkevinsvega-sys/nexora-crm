import { Module } from '@nestjs/common'
import { HelpdeskConversationsController } from './helpdesk-conversations.controller'
import { HelpdeskMailboxesController } from './helpdesk-mailboxes.controller'
import { HelpdeskConversationsGrpcController } from '../grpc/helpdesk-conversations-grpc.controller'
import { HelpdeskAgentsMailboxesGrpcController } from '../grpc/helpdesk-agents-mailboxes-grpc.controller'
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
import { ConversationRepository } from '../../domain/repositories/conversation.repository'
import { ThreadRepository } from '../../domain/repositories/thread.repository'
import { AgentRepository } from '../../domain/repositories/agent.repository'
import { MailboxRepository } from '../../domain/repositories/mailbox.repository'
import { DrizzleConversationRepository } from '../../infrastructure/drizzle-conversation.repository'
import { DrizzleThreadRepository } from '../../infrastructure/drizzle-thread.repository'
import { DrizzleAgentRepository } from '../../infrastructure/drizzle-agent.repository'
import { DrizzleMailboxRepository } from '../../infrastructure/drizzle-mailbox.repository'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Module({
  controllers: [
    HelpdeskConversationsController,
    HelpdeskMailboxesController,
    HelpdeskConversationsGrpcController,
    HelpdeskAgentsMailboxesGrpcController,
  ],
  providers: [
    CreateConversationHandler,
    AssignConversationHandler,
    ChangeConversationStatusHandler,
    ResolveConversationHandler,
    AddThreadHandler,
    UpdateAgentAvailabilityHandler,
    CreateMailboxHandler,
    GetConversationHandler,
    ListConversationsHandler,
    ListThreadsHandler,
    GetAgentProfileHandler,
    ListMailboxesHandler,
    OutboxService,
    { provide: ConversationRepository, useClass: DrizzleConversationRepository },
    { provide: ThreadRepository, useClass: DrizzleThreadRepository },
    { provide: AgentRepository, useClass: DrizzleAgentRepository },
    { provide: MailboxRepository, useClass: DrizzleMailboxRepository },
  ],
  exports: [ConversationRepository, ThreadRepository, AgentRepository, MailboxRepository],
})
export class HelpdeskModule {}
