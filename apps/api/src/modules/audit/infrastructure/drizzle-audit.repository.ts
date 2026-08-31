/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common'
import { eq, and, gte, lte, gt, asc, desc } from 'drizzle-orm'
import { getDb, auditLogs as auditLogsTable } from '@crm/database'
import { AuditRepository } from '../domain/repositories/audit.repository'
import { AuditLog, AuditStats, EntityAuditSummary, ModuleStats } from '../domain/entities/audit.entity'
import { AuditMapper } from './audit.mapper'

@Injectable()
export class DrizzleAuditRepository extends AuditRepository {
  private get db() { return getDb() }

  async findById(id: string): Promise<AuditLog | null> {
    const row = await this.db.query.auditLogs.findFirst({ where: eq(auditLogsTable.id, id) as any })
    return row ? AuditMapper.toDomain(row) : null
  }

  async save(log: AuditLog): Promise<void> {
    await this.db.insert(auditLogsTable).values({
      id: log.id, tenantId: log.tenantId, entityType: log.entityType,
      entityId: log.entityId, action: log.action, fieldName: log.fieldName,
      oldValue: log.oldValue, newValue: log.newValue, changedByUserId: log.changedByUserId,
      moduleName: log.moduleName, correlationId: log.correlationId,
      ipAddress: log.ipAddress, userAgent: log.userAgent,
      metadataJson: log.metadataJson, createdAt: log.createdAt,
    } as any).onConflictDoNothing()
  }

  async list(params: {
    tenantId?: string; entityType?: string; entityId?: string; action?: string
    moduleName?: string; userId?: string; fromDate?: string; toDate?: string
    cursor?: string; limit?: number
  }): Promise<{ data: AuditLog[]; nextCursor: string | null }> {
    const conditions: any[] = []
    if (params.tenantId) conditions.push(eq(auditLogsTable.tenantId, params.tenantId))
    if (params.entityType) conditions.push(eq(auditLogsTable.entityType, params.entityType))
    if (params.entityId) conditions.push(eq(auditLogsTable.entityId, params.entityId))
    if (params.action) conditions.push(eq(auditLogsTable.action, params.action))
    if (params.moduleName) conditions.push(eq(auditLogsTable.moduleName, params.moduleName))
    if (params.userId) conditions.push(eq(auditLogsTable.changedByUserId, params.userId))
    if (params.fromDate) conditions.push(gte(auditLogsTable.createdAt, new Date(params.fromDate)))
    if (params.toDate) conditions.push(lte(auditLogsTable.createdAt, new Date(params.toDate)))
    if (params.cursor) conditions.push(gt(auditLogsTable.createdAt, new Date(params.cursor)))
    const limit = params.limit ?? 20
    const rows = await this.db.query.auditLogs.findMany({
      where: conditions.length ? and(...conditions) as any : undefined,
      limit: limit + 1, orderBy: [asc(auditLogsTable.createdAt)],
    })
    const hasMore = rows.length > limit
    return {
      data: (hasMore ? rows.slice(0, limit) : rows).map(r => AuditMapper.toDomain(r)),
      nextCursor: hasMore ? rows[limit - 1].createdAt.toISOString() : null,
    }
  }

  async getEntityAudit(entityType: string, entityId: string, tenantId?: string): Promise<AuditLog[]> {
    const conditions: any[] = [
      eq(auditLogsTable.entityType, entityType),
      eq(auditLogsTable.entityId, entityId),
    ]
    if (tenantId) conditions.push(eq(auditLogsTable.tenantId, tenantId))
    const rows = await this.db.query.auditLogs.findMany({
      where: and(...conditions) as any, orderBy: [desc(auditLogsTable.createdAt)],
    })
    return rows.map(r => AuditMapper.toDomain(r))
  }

  async getEntityAuditSummary(entityType: string, entityId: string, tenantId?: string): Promise<EntityAuditSummary> {
    const conditions: any[] = [
      eq(auditLogsTable.entityType, entityType),
      eq(auditLogsTable.entityId, entityId),
    ]
    if (tenantId) conditions.push(eq(auditLogsTable.tenantId, tenantId))
    const rows = await this.db.query.auditLogs.findMany({
      where: and(...conditions) as any, orderBy: [desc(auditLogsTable.createdAt)],
    })
    if (!rows.length) return { entityType, entityId, totalChanges: 0, lastChangeAt: null, lastChangeBy: null, changesByField: {} }
    const last = rows[0]
    const changesByField: Record<string, { count: number; lastValue: string | null }> = {}
    for (const r of rows) {
      if (r.fieldName) {
        if (!changesByField[r.fieldName]) changesByField[r.fieldName] = { count: 0, lastValue: null }
        changesByField[r.fieldName].count++
        changesByField[r.fieldName].lastValue = r.newValue
      }
    }
    return { entityType, entityId, totalChanges: rows.length, lastChangeAt: last.createdAt.toISOString(), lastChangeBy: last.changedByUserId, changesByField }
  }

  async getAuditStats(tenantId?: string, fromDate?: string, toDate?: string): Promise<AuditStats> {
    const conditions: any[] = []
    if (tenantId) conditions.push(eq(auditLogsTable.tenantId, tenantId))
    if (fromDate) conditions.push(gte(auditLogsTable.createdAt, new Date(fromDate)))
    if (toDate) conditions.push(lte(auditLogsTable.createdAt, new Date(toDate)))
    const where = conditions.length ? and(...conditions) : undefined
    const allRows = await this.db.query.auditLogs.findMany({ where: where as any, columns: { action: true, moduleName: true, entityType: true, createdAt: true } })
    const byAction: Record<string, number> = {}
    const byModule: Record<string, number> = {}
    const byEntity: Record<string, number> = {}
    for (const r of allRows as any[]) {
      byAction[r.action] = (byAction[r.action] ?? 0) + 1
      const mod = r.moduleName ?? 'unknown'
      byModule[mod] = (byModule[mod] ?? 0) + 1
      byEntity[r.entityType] = (byEntity[r.entityType] ?? 0) + 1
    }
    const dates = allRows.map((r: any) => r.createdAt).filter(Boolean).sort()
    return { totalLogs: allRows.length, byAction, byModule, byEntity,
      periodStart: dates[0]?.toISOString() ?? new Date().toISOString(),
      periodEnd: dates[dates.length - 1]?.toISOString() ?? new Date().toISOString() }
  }

  async getModuleStats(tenantId?: string, fromDate?: string, toDate?: string): Promise<ModuleStats[]> {
    const conditions: any[] = []
    if (tenantId) conditions.push(eq(auditLogsTable.tenantId, tenantId))
    if (fromDate) conditions.push(gte(auditLogsTable.createdAt, new Date(fromDate)))
    if (toDate) conditions.push(lte(auditLogsTable.createdAt, new Date(toDate)))
    const where = conditions.length ? and(...conditions) : undefined
    const rows = await this.db.query.auditLogs.findMany({ where: where as any, columns: { moduleName: true, action: true, createdAt: true } })
    const grouped: Record<string, { totalLogs: number; lastActivity: Date | null; actions: Record<string, number> }> = {}
    for (const r of rows as any[]) {
      const mod = r.moduleName ?? 'unknown'
      if (!grouped[mod]) grouped[mod] = { totalLogs: 0, lastActivity: null, actions: {} }
      grouped[mod].totalLogs++
      grouped[mod].actions[r.action] = (grouped[mod].actions[r.action] ?? 0) + 1
      if (!grouped[mod].lastActivity || r.createdAt > grouped[mod].lastActivity) grouped[mod].lastActivity = r.createdAt
    }
    return Object.entries(grouped).map(([moduleName, data]) => ({
      moduleName, totalLogs: data.totalLogs,
      lastActivity: data.lastActivity?.toISOString() ?? null,
      actions: data.actions,
    }))
  }
}
