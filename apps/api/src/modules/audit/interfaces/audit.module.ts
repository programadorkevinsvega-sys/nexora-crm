import { Module } from '@nestjs/common'
import { OutboxModule } from '../../../common/outbox/outbox.module'
import { AuditGrpcController } from './grpc/audit-grpc.controller'
import {
  CreateAuditLogHandler, ListAuditLogsHandler, GetAuditLogHandler,
  GetEntityAuditHandler, GetEntityAuditSummaryHandler,
  GetAuditStatsHandler, GetModuleStatsHandler,
} from '../application/handlers'
import { AuditRepository } from '../domain/repositories/audit.repository'
import { DrizzleAuditRepository } from '../infrastructure/drizzle-audit.repository'

@Module({
  imports: [OutboxModule],
  controllers: [AuditGrpcController],
  providers: [
    CreateAuditLogHandler, ListAuditLogsHandler, GetAuditLogHandler,
    GetEntityAuditHandler, GetEntityAuditSummaryHandler,
    GetAuditStatsHandler, GetModuleStatsHandler,
    { provide: AuditRepository, useClass: DrizzleAuditRepository },
  ],
  exports: [AuditRepository],
})
export class AuditModule {}
