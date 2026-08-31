import { Injectable } from '@nestjs/common'
import { MetaLeadsRepository } from '../../domain/repositories/meta-leads.repository'
import { MetaLeadLog } from '../../domain/entities/meta-lead-log.entity'

@Injectable()
export class SaveMetaLeadLogUseCase {
  constructor(private readonly repo: MetaLeadsRepository) {}

  async execute(props: {
    tenantId: string
    metaIntegrationId?: string | null
    leadgenId: string
    formId?: string | null
    formName?: string | null
    adId?: string | null
    adName?: string | null
    campaignName?: string | null
    contactId?: string | null
    dealId?: string | null
    leadData?: Record<string, any>
    status?: string
    errorMessage?: string | null
  }): Promise<MetaLeadLog> {
    const log = MetaLeadLog.create(props)
    return this.repo.saveLog(log)
  }
}
