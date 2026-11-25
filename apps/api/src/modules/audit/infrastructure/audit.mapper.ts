import { AuditLog, AuditStats, EntityAuditSummary, ModuleStats } from '../domain/entities/audit.entity'
import type { auditLogs } from '@crm/database'

type AuditLogRow = typeof auditLogs.$inferSelect

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export class AuditMapper {
  static toDomain(row: AuditLogRow): AuditLog {
    return new AuditLog(
      row.id,
      row.tenantId,
      row.entityType,
      row.entityId,
      row.action,
      row.fieldName,
      row.oldValue,
      row.newValue,
      row.changedByUserId,
      row.moduleName,
      row.correlationId,
      row.ipAddress,
      row.userAgent,
      isRecord(row.metadataJson) ? row.metadataJson : null,
      row.createdAt,
    )
  }

  static toResponse(log: AuditLog) {
    return {
      id: log.id,
      tenantId: log.tenantId,
      entityType: log.entityType,
      entityId: log.entityId,
      action: log.action,
      fieldName: log.fieldName,
      oldValue: log.oldValue,
      newValue: log.newValue,
      changedByUserId: log.changedByUserId,
      moduleName: log.moduleName,
      correlationId: log.correlationId,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      metadata: log.metadataJson,
      createdAt: log.createdAt.toISOString(),
    }
  }

  static statsToResponse(stats: AuditStats) {
    return {
      totalLogs: stats.totalLogs,
      byAction: stats.byAction,
      byModule: stats.byModule,
      byEntity: stats.byEntity,
      periodStart: stats.periodStart,
      periodEnd: stats.periodEnd,
    }
  }

  static summaryToResponse(summary: EntityAuditSummary) {
    return {
      entityType: summary.entityType,
      entityId: summary.entityId,
      totalChanges: summary.totalChanges,
      lastChangeAt: summary.lastChangeAt,
      lastChangeBy: summary.lastChangeBy,
      changesByField: summary.changesByField,
    }
  }

  static moduleStatsToResponse(stats: ModuleStats) {
    return {
      moduleName: stats.moduleName,
      totalLogs: stats.totalLogs,
      lastActivity: stats.lastActivity,
      actions: stats.actions,
    }
  }
}
