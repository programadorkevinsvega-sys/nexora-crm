import { Injectable } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'

export interface AuditFilters {
  entityType?: string
  entityId?: string
  action?: string
  moduleName?: string
  userId?: string
  limit?: number
  cursor?: string
}

@Injectable()
export class AuditBffService {
  constructor(private readonly api: ApiCoreGrpcClient) {}

  async list(filters: AuditFilters, tenantId: string) {
    return this.api.listAuditLogs({ tenantId, ...filters })
  }

  async getStats(tenantId: string) {
    return this.api.getAuditStats(tenantId)
  }
}
