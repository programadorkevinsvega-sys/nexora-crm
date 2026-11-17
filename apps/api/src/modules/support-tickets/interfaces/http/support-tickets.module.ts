import { Module } from '@nestjs/common'
import { SupportTicketsController } from './support-tickets.controller'
import { SupportTicketsGrpcController } from '../../interfaces/grpc/support-tickets-grpc.controller'
import { CreateTicketHandler, UpdateTicketStatusHandler, AssignTicketHandler, AddReplyHandler } from '../../application/commands/support-ticket.handlers'
import { GetTicketHandler, ListTicketsHandler, GetTicketRepliesHandler } from '../../application/queries/support-ticket.handlers'
import { TicketRepository } from '../../domain/repositories/ticket.repository'
import { ReplyRepository } from '../../domain/repositories/reply.repository'
import { DrizzleTicketRepository } from '../../infrastructure/drizzle-ticket.repository'
import { DrizzleReplyRepository } from '../../infrastructure/drizzle-reply.repository'
import { SupportTicketsConsumerService } from '../../infrastructure/support-tickets-consumer.service'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Module({
  controllers: [SupportTicketsController, SupportTicketsGrpcController],
  providers: [
    CreateTicketHandler,
    UpdateTicketStatusHandler,
    AssignTicketHandler,
    AddReplyHandler,
    GetTicketHandler,
    ListTicketsHandler,
    GetTicketRepliesHandler,
    SupportTicketsConsumerService,
    OutboxService,
    { provide: TicketRepository, useClass: DrizzleTicketRepository },
    { provide: ReplyRepository, useClass: DrizzleReplyRepository },
  ],
  exports: [TicketRepository, ReplyRepository],
})
export class SupportTicketsModule {}
