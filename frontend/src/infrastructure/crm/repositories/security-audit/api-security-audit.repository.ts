import type {
  SecurityAccessLog,
  SecurityAnomaly,
  ResolveAnomalyDto,
} from '@crm/contracts'
import { api } from '../../api/api-client'

export class ApiSecurityAuditRepository {
  static async listLogs(): Promise<SecurityAccessLog[]> {
    return api.get<SecurityAccessLog[]>('/api/security-audit/logs')
  }

  static async listAnomalies(): Promise<SecurityAnomaly[]> {
    return api.get<SecurityAnomaly[]>('/api/security-audit/anomalies')
  }

  static async resolveAnomaly(anomalyId: string, dto: ResolveAnomalyDto): Promise<SecurityAnomaly> {
    return api.post<SecurityAnomaly>(`/api/security-audit/anomalies/${anomalyId}/resolve`, dto)
  }
}
