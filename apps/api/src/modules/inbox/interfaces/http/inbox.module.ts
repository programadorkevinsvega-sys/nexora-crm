import { Module } from '@nestjs/common'
import { InboxController } from './inbox.controller'
import { InboxGrpcController } from '../grpc/inbox-grpc.controller'
import { SendInboxMessageHandler } from '../../application/commands/inbox.handlers'
import {
  ListInboxConversationsHandler,
  GetInboxConversationHandler,
} from '../../application/queries/inbox.handlers'
import { InboxRepository } from '../../domain/repositories/inbox.repository'
import { DrizzleInboxRepository } from '../../infrastructure/drizzle-inbox.repository'

@Module({
  controllers: [InboxController, InboxGrpcController],
  providers: [
    SendInboxMessageHandler,
    ListInboxConversationsHandler,
    GetInboxConversationHandler,
    {
      provide: InboxRepository,
      useClass: DrizzleInboxRepository,
    },
  ],
  exports: [InboxRepository, SendInboxMessageHandler, ListInboxConversationsHandler],
})
export class InboxModule {}
