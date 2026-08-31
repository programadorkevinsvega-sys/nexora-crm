import { Injectable, NotFoundException } from '@nestjs/common'
import { MetaLeadsRepository } from '../../domain/repositories/meta-leads.repository'
import { MetaIntegration } from '../../domain/entities/meta-integration.entity'

@Injectable()
export class UpdateMetaConfigUseCase {
  constructor(private readonly repo: MetaLeadsRepository) {}

  async execute(dto: Partial<MetaIntegration> & { tenantId: string }): Promise<MetaIntegration> {
    const existing = await this.repo.findByTenantId(dto.tenantId)
    if (!existing) throw new NotFoundException(`Meta integration for tenant ${dto.tenantId} not found`)

    return this.repo.update({
      ...dto,
      id: existing.id,
      tenantId: dto.tenantId,
    })
  }
}
