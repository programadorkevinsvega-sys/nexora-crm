import { Injectable, NotFoundException } from '@nestjs/common'
import { AuditRepository } from '../domain/repositories/audit.repository'
import { AuditLog } from '../domain/entities/audit.entity'
import { OutboxService } from '../../../common/outbox/outbox.service'
import { AuditLogCreatedEvent } from '../domain/events/audit.events'

export class CreateAuditLogCommand {
  constructor(
    readonly tenantId: string | undefined, readonly entityType: string, readonly entityId: string,
    readonly action: string, readonly fieldName?: string, readonly oldValue?: string,
    readonly newValue?: string, readonly changedByUserId?: string, readonly moduleName?: string,
    readonly correlationId?: string, readonly ipAddress?: string, readonly userAgent?: string,
    readonly metadata?: Record<string, unknown>,
  ) {}
}
export class ListAuditLogsQuery {
  constructor(
    readonly tenantId?: string, readonly entityType?: string, readonly entityId?: string,
    readonly action?: string, readonly moduleName?: string, readonly userId?: string,
    readonly fromDate?: string, readonly toDate?: string, readonly cursor?: string,
    readonly limit?: number,
  ) {}
}
export class GetEntityAuditQuery {
  constructor(readonly entityType: string, readonly entityId: string, readonly tenantId?: string) {}
}
export class GetEntityAuditSummaryQuery {
  constructor(readonly entityType: string, readonly entityId: string, readonly tenantId?: string) {}
}
export class GetAuditStatsQuery {
  constructor(readonly tenantId?: string, readonly fromDate?: string, readonly toDate?: string) {}
}
export class GetModuleStatsQuery {
  constructor(readonly tenantId?: string, readonly fromDate?: string, readonly toDate?: string) {}
}

@Injectable()
export class CreateAuditLogHandler {
  constructor(private readonly repo: AuditRepository, private readonly outbox: OutboxService) {}
  async execute(cmd: CreateAuditLogCommand): Promise<AuditLog> {
    const log = AuditLog.create({
      tenantId: cmd.tenantId, entityType: cmd.entityType, entityId: cmd.entityId,
      action: cmd.action, fieldName: cmd.fieldName, oldValue: cmd.oldValue,
      newValue: cmd.newValue, changedByUserId: cmd.changedByUserId,
      moduleName: cmd.moduleName, correlationId: cmd.correlationId,
      ipAddress: cmd.ipAddress, userAgent: cmd.userAgent, metadata: cmd.metadata,
    })
    await this.repo.save(log)
    await this.outbox.publish(new AuditLogCreatedEvent(log.id, log.tenantId, log.entityType, log.entityId, log.action, log.moduleName, log.changedByUserId))
    return log
  }
}
@Injectable()
export class ListAuditLogsHandler {
  constructor(private readonly repo: AuditRepository) {}
  async execute(q: ListAuditLogsQuery) { return this.repo.list(q) }
}
@Injectable()
export class GetAuditLogHandler {
  constructor(private readonly repo: AuditRepository) {}
  async execute(id: string): Promise<AuditLog> {
    const log = await this.repo.findById(id)
    if (!log) throw new NotFoundException('Audit log not found'); return log
  }
}
@Injectable()
export class GetEntityAuditHandler {
  constructor(private readonly repo: AuditRepository) {}
  async execute(q: GetEntityAuditQuery) { return this.repo.getEntityAudit(q.entityType, q.entityId, q.tenantId) }
}
@Injectable()
export class GetEntityAuditSummaryHandler {
  constructor(private readonly repo: AuditRepository) {}
  async execute(q: GetEntityAuditSummaryQuery) { return this.repo.getEntityAuditSummary(q.entityType, q.entityId, q.tenantId) }
}
@Injectable()
export class GetAuditStatsHandler {
  constructor(private readonly repo: AuditRepository) {}
  async execute(q: GetAuditStatsQuery) { return this.repo.getAuditStats(q.tenantId, q.fromDate, q.toDate) }
}
@Injectable()
export class GetModuleStatsHandler {
  constructor(private readonly repo: AuditRepository) {}
  async execute(q: GetModuleStatsQuery) { return this.repo.getModuleStats(q.tenantId, q.fromDate, q.toDate) }
}
