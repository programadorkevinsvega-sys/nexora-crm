import { Injectable } from '@nestjs/common'
import { MetaLeadsRepository } from '../../domain/repositories/meta-leads.repository'
import { MetaLeadLog } from '../../domain/entities/meta-lead-log.entity'

@Injectable()
export class ListMetaLogsUseCase {
  constructor(private readonly repo: MetaLeadsRepository) {}

  async execute(tenantId: string, limit = 50): Promise<MetaLeadLog[]> {
    return this.repo.listLogs(tenantId, limit)
  }
}
