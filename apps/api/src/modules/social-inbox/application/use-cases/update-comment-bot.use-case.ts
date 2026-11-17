import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import { SocialInboxRepository } from '../../domain/repositories/social-inbox.repository'
import { SocialComment } from '../../domain/entities/social-comment.entity'

@Injectable()
export class UpdateCommentBotUseCase {
  constructor(@Inject('SocialInboxRepository') private readonly repo: SocialInboxRepository) {}

  async execute(tenantId: string, commentId: string, replyMessage: string, repliedBy: string, repliedAt: Date): Promise<SocialComment> {
    const comment = await this.repo.getComment(tenantId, commentId)
    if (!comment) throw new NotFoundException('Comment not found')

    const updated = comment.botReply(replyMessage, repliedBy, repliedAt)
    await this.repo.saveComment(updated)
    return updated
  }
}
