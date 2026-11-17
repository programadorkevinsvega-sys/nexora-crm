import type {
  DeduplicationRule,
  CreateDeduplicationRuleDto,
  DuplicateGroup,
  MergeRecordsDto,
  DeduplicationAuditLog,
  DeduplicationEntityType,
} from '@crm/contracts'
import { api, qs } from '../../api/api-client'

export class ApiDeduplicationRepository {
  static async listRules(): Promise<DeduplicationRule[]> {
    return api.get<DeduplicationRule[]>('/api/deduplication/rules')
  }

  static async createRule(dto: CreateDeduplicationRuleDto): Promise<DeduplicationRule> {
    return api.post<DeduplicationRule>('/api/deduplication/rules', dto)
  }

  static async scanDuplicates(entityType: DeduplicationEntityType): Promise<DuplicateGroup[]> {
    return api.get<DuplicateGroup[]>(`/api/deduplication/scan${qs({ entityType })}`)
  }

  static async mergeRecords(dto: MergeRecordsDto): Promise<DeduplicationAuditLog> {
    return api.post<DeduplicationAuditLog>('/api/deduplication/merge', dto)
  }

  static async listAuditLogs(): Promise<DeduplicationAuditLog[]> {
    return api.get<DeduplicationAuditLog[]>('/api/deduplication/audit-logs')
  }
}
