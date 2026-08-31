import { Injectable, Inject } from '@nestjs/common'
import { SocialInboxRepository } from '../../domain/repositories/social-inbox.repository'
import { SocialAutoResponderRule } from '../../domain/entities/social-rule.entity'

@Injectable()
export class ListRulesUseCase {
  constructor(@Inject('SocialInboxRepository') private readonly repo: SocialInboxRepository) {}

  async execute(tenantId: string): Promise<SocialAutoResponderRule[]> {
    return this.repo.listRules(tenantId)
  }
}
