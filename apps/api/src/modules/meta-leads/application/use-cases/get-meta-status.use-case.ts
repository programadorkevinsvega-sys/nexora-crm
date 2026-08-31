import { Injectable } from '@nestjs/common'
import { MetaLeadsRepository } from '../../domain/repositories/meta-leads.repository'
import { MetaIntegration } from '../../domain/entities/meta-integration.entity'

@Injectable()
export class GetMetaStatusUseCase {
  constructor(private readonly repo: MetaLeadsRepository) {}

  async execute(tenantId: string): Promise<MetaIntegration> {
    const existing = await this.repo.findByTenantId(tenantId)
    if (existing) return existing

    const created = MetaIntegration.create({ tenantId })
    return this.repo.save(created)
  }
}
