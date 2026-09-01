/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq, and, gt, asc } from 'drizzle-orm'
import {
  getDb,
  tenantSystemAuditLogs as auditLogsTable,
  globalSystemParameters as sysParamsTable,
} from '@crm/database'
import { SystemAuditLog, SystemParameter } from '../domain/entities/config.entity'
import { TenantsMapper } from './tenants.mapper'

export class TenantsAuditParamsDrizzleHelper {
  private static get db() { return getDb() }

  static async listAuditLogs(tenantId: string, moduleName?: string, cursor?: string, limit = 20): Promise<{ data: SystemAuditLog[]; nextCursor: string | null }> {
    const conditions: any[] = [eq(auditLogsTable.tenantId, tenantId)]
    if (cursor) conditions.push(gt(auditLogsTable.createdAt, new Date(cursor)))
    if (moduleName) conditions.push(eq(auditLogsTable.moduleName, moduleName))
    const rows = await this.db.query.tenantSystemAuditLogs.findMany({
      where: and(...conditions) as any,
      limit: limit + 1,
      orderBy: [asc(auditLogsTable.createdAt)],
    })
    const hasMore = rows.length > limit
    const data = hasMore ? rows.slice(0, limit) : rows
    return {
      data: data.map((r) => TenantsMapper.auditLogToDomain(r as any)),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  static async getParameter(paramKey: string): Promise<SystemParameter | null> {
    const row = await this.db.query.globalSystemParameters.findFirst({ where: eq(sysParamsTable.paramKey, paramKey) as any })
    return row ? TenantsMapper.sysParamToDomain(row as any) : null
  }

  static async setParameter(param: SystemParameter): Promise<void> {
    await this.db.insert(sysParamsTable).values({
      paramKey: param.paramKey,
      paramValue: param.paramValue,
      description: param.description,
      dataType: param.dataType,
      isPublic: param.isPublic,
      createdAt: param.createdAt,
      updatedAt: param.updatedAt,
    } as any).onConflictDoUpdate({
      target: sysParamsTable.paramKey,
      set: { paramValue: param.paramValue, updatedAt: param.updatedAt } as any,
    })
  }
}
