import type {
  SecurityAccessLog,
  RecordAccessEventDto,
  SecurityAnomaly,
  ResolveAnomalyDto,
} from '@crm/contracts'

export class ApiSecurityAuditRepository {
  static async listLogs(): Promise<SecurityAccessLog[]> {
    const res = await fetch('/api/security-audit/logs', { credentials: 'include' })
    if (!res.ok) throw new Error('Error al listar bitácora de seguridad')
    return res.json()
  }

  static async listAnomalies(): Promise<SecurityAnomaly[]> {
    const res = await fetch('/api/security-audit/anomalies', { credentials: 'include' })
    if (!res.ok) throw new Error('Error al listar anomalías de seguridad')
    return res.json()
  }

  static async resolveAnomaly(anomalyId: string, dto: ResolveAnomalyDto): Promise<SecurityAnomaly> {
    const res = await fetch(`/api/security-audit/anomalies/${anomalyId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    })
    if (!res.ok) throw new Error('Error al resolver alerta de seguridad')
    return res.json()
  }
}
