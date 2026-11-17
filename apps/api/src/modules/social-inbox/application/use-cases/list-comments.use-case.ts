import { Injectable, Inject } from '@nestjs/common'
import { SocialInboxRepository } from '../../domain/repositories/social-inbox.repository'
import { SocialComment } from '../../domain/entities/social-comment.entity'

@Injectable()
export class ListCommentsUseCase {
  constructor(@Inject('SocialInboxRepository') private readonly repo: SocialInboxRepository) {}

  async execute(tenantId: string, platform?: string, status?: string): Promise<SocialComment[]> {
    return this.repo.listComments(tenantId, platform, status)
  }
}
