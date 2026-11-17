import { Injectable } from '@nestjs/common'
import { MetaLeadsRepository } from '../../domain/repositories/meta-leads.repository'

@Injectable()
export class DisconnectMetaUseCase {
  constructor(private readonly repo: MetaLeadsRepository) {}

  async execute(tenantId: string): Promise<void> {
    const existing = await this.repo.findByTenantId(tenantId)
    if (existing) {
      await this.repo.update({
        id: existing.id,
        tenantId,
        status: 'DISCONNECTED',
        accessToken: null,
        pageAccessToken: null,
        selectedPageId: null,
        selectedPageName: null,
        adAccountId: null,
        adAccountName: null,
        leadGenForms: [],
      })
    }
  }
}
