import { Injectable, Inject } from '@nestjs/common'
import { SocialInboxRepository } from '../../domain/repositories/social-inbox.repository'

@Injectable()
export class DeleteRuleUseCase {
  constructor(@Inject('SocialInboxRepository') private readonly repo: SocialInboxRepository) {}

  async execute(tenantId: string, id: string): Promise<void> {
    await this.repo.deleteRule(tenantId, id)
  }
}
