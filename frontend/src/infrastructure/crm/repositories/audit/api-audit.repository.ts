import { api, qs } from "../../api/api-client"

export interface AuditLogItem {
  id: string
  tenantId: string | null
  entityType: string
  entityId: string
  action: string
  fieldName: string | null
  oldValue: string | null
  newValue: string | null
  changedByUserId: string | null
  moduleName: string | null
  correlationId: string | null
  ipAddress: string | null
  userAgent: string | null
  metadataJson: Record<string, unknown> | null
  createdAt: string
}

export interface AuditStats {
  totalLogs: number
  byAction: Record<string, number>
  byModule: Record<string, number>
}

export class ApiAuditRepository {
  static async listLogs(filters?: {
    entityType?: string
    action?: string
    moduleName?: string
    limit?: number
    cursor?: string
  }): Promise<{ data: AuditLogItem[]; nextCursor: string | null }> {
    const query = qs({
      entityType: filters?.entityType,
      action: filters?.action,
      moduleName: filters?.moduleName,
      limit: filters?.limit,
      cursor: filters?.cursor,
    })
    const res = await api.get<any>(`/api/audit/logs${query}`)
    return res && Array.isArray(res.data) ? res : { data: Array.isArray(res) ? res : [], nextCursor: null }
  }

  static async getStats(): Promise<AuditStats> {
    const res = await api.get<any>('/api/audit/stats')
    return res || { totalLogs: 0, byAction: {}, byModule: {} }
  }
}
