import { Injectable, Inject } from '@nestjs/common'
import { SocialInboxRepository } from '../../domain/repositories/social-inbox.repository'

@Injectable()
export class AutoCreateContactUseCase {
  constructor(@Inject('SocialInboxRepository') private readonly repo: SocialInboxRepository) {}

  async execute(tenantId: string, authorName: string, platform: string): Promise<void> {
    await this.repo.autoCreateContact(tenantId, authorName, platform)
  }
}
