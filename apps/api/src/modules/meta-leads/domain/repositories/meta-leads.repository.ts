import { MetaIntegration } from '../entities/meta-integration.entity'
import { MetaLeadLog } from '../entities/meta-lead-log.entity'

export abstract class MetaLeadsRepository {
  abstract findByTenantId(tenantId: string): Promise<MetaIntegration | null>
  abstract save(integration: MetaIntegration): Promise<MetaIntegration>
  abstract update(integration: Partial<MetaIntegration> & { id: string; tenantId: string }): Promise<MetaIntegration>
  abstract saveLog(log: MetaLeadLog): Promise<MetaLeadLog>
  abstract listLogs(tenantId: string, limit?: number): Promise<MetaLeadLog[]>
}
