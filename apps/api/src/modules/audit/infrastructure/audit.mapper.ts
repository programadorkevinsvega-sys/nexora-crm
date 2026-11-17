import { AuditLog, AuditStats, EntityAuditSummary, ModuleStats } from '../domain/entities/audit.entity'

export class AuditMapper {
  static toDomain(r: any): AuditLog {
    return new AuditLog(r.id, r.tenantId, r.entityType, r.entityId, r.action,
      r.fieldName, r.oldValue, r.newValue, r.changedByUserId, r.moduleName,
      r.correlationId, r.ipAddress, r.userAgent, r.metadataJson, r.createdAt)
  }
  static toResponse(l: AuditLog) {
    return { id: l.id, tenantId: l.tenantId, entityType: l.entityType, entityId: l.entityId,
      action: l.action, fieldName: l.fieldName, oldValue: l.oldValue, newValue: l.newValue,
      changedByUserId: l.changedByUserId, moduleName: l.moduleName, correlationId: l.correlationId,
      ipAddress: l.ipAddress, userAgent: l.userAgent,
      metadata: l.metadataJson, createdAt: l.createdAt.toISOString() }
  }
  static statsToResponse(s: AuditStats) {
    return { totalLogs: s.totalLogs, byAction: s.byAction, byModule: s.byModule,
      byEntity: s.byEntity, periodStart: s.periodStart, periodEnd: s.periodEnd }
  }
  static summaryToResponse(s: EntityAuditSummary) {
    return { entityType: s.entityType, entityId: s.entityId, totalChanges: s.totalChanges,
      lastChangeAt: s.lastChangeAt, lastChangeBy: s.lastChangeBy, changesByField: s.changesByField }
  }
  static moduleStatsToResponse(m: ModuleStats) {
    return { moduleName: m.moduleName, totalLogs: m.totalLogs, lastActivity: m.lastActivity, actions: m.actions }
  }
}
