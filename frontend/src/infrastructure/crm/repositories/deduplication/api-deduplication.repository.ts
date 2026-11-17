import type {
  DeduplicationRule,
  CreateDeduplicationRuleDto,
  DuplicateGroup,
  MergeRecordsDto,
  DeduplicationAuditLog,
  DeduplicationEntityType,
} from '@crm/contracts'

export class ApiDeduplicationRepository {
  static async listRules(): Promise<DeduplicationRule[]> {
    const res = await fetch('/api/deduplication/rules', { credentials: 'include' })
    if (!res.ok) throw new Error('Error al listar reglas de deduplicación')
    return res.json()
  }

  static async createRule(dto: CreateDeduplicationRuleDto): Promise<DeduplicationRule> {
    const res = await fetch('/api/deduplication/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    })
    if (!res.ok) throw new Error('Error al crear regla de deduplicación')
    return res.json()
  }

  static async scanDuplicates(entityType: DeduplicationEntityType): Promise<DuplicateGroup[]> {
    const res = await fetch(`/api/deduplication/scan?entityType=${entityType}`, {
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Error al escanear duplicados')
    return res.json()
  }

  static async mergeRecords(dto: MergeRecordsDto): Promise<DeduplicationAuditLog> {
    const res = await fetch('/api/deduplication/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    })
    if (!res.ok) throw new Error('Error al fusionar registros')
    return res.json()
  }

  static async listAuditLogs(): Promise<DeduplicationAuditLog[]> {
    const res = await fetch('/api/deduplication/audit-logs', { credentials: 'include' })
    if (!res.ok) throw new Error('Error al listar auditorías de merge')
    return res.json()
  }
}
