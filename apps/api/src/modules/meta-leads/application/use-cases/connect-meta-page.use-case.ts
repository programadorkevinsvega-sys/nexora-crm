import { Injectable } from '@nestjs/common'
import { MetaLeadsRepository } from '../../domain/repositories/meta-leads.repository'
import { MetaIntegration, MetaLeadForm } from '../../domain/entities/meta-integration.entity'

export interface ConnectMetaPageDto {
  tenantId: string
  pageId: string
  pageName: string
  pageAccessToken?: string
  adAccountId?: string
  adAccountName?: string
  userAccessToken?: string
  metaAppId?: string
  leadGenForms?: MetaLeadForm[]
}

@Injectable()
export class ConnectMetaPageUseCase {
  constructor(private readonly repo: MetaLeadsRepository) {}

  async execute(dto: ConnectMetaPageDto): Promise<MetaIntegration> {
    let integration = await this.repo.findByTenantId(dto.tenantId)
    if (!integration) {
      integration = await this.repo.save(MetaIntegration.create({ tenantId: dto.tenantId, metaAppId: dto.metaAppId }))
    }

    return this.repo.update({
      id: integration.id,
      tenantId: dto.tenantId,
      status: 'CONNECTED',
      selectedPageId: dto.pageId,
      selectedPageName: dto.pageName,
      pageAccessToken: dto.pageAccessToken || null,
      adAccountId: dto.adAccountId || null,
      adAccountName: dto.adAccountName || null,
      accessToken: dto.userAccessToken || null,
      metaAppId: dto.metaAppId || null,
      leadGenForms: dto.leadGenForms || [],
      lastSyncAt: new Date(),
    })
  }
}
