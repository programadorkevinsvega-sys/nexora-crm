import { AuditLog, AuditStats, EntityAuditSummary, ModuleStats } from '../entities/audit.entity'

export abstract class AuditRepository {
  abstract findById(id: string): Promise<AuditLog | null>
  abstract save(log: AuditLog): Promise<void>
  abstract list(params: {
    tenantId?: string; entityType?: string; entityId?: string; action?: string
    moduleName?: string; userId?: string; fromDate?: string; toDate?: string
    cursor?: string; limit?: number
  }): Promise<{ data: AuditLog[]; nextCursor: string | null }>
  abstract getEntityAudit(entityType: string, entityId: string, tenantId?: string): Promise<AuditLog[]>
  abstract getEntityAuditSummary(entityType: string, entityId: string, tenantId?: string): Promise<EntityAuditSummary>
  abstract getAuditStats(tenantId?: string, fromDate?: string, toDate?: string): Promise<AuditStats>
  abstract getModuleStats(tenantId?: string, fromDate?: string, toDate?: string): Promise<ModuleStats[]>
}
