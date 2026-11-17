import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import { SocialInboxRepository } from '../../domain/repositories/social-inbox.repository'
import { SocialComment } from '../../domain/entities/social-comment.entity'

@Injectable()
export class ReplyCommentUseCase {
  constructor(@Inject('SocialInboxRepository') private readonly repo: SocialInboxRepository) {}

  async execute(tenantId: string, commentId: string, replyMessage: string, repliedBy: string): Promise<SocialComment> {
    const comment = await this.repo.getComment(tenantId, commentId)
    if (!comment) throw new NotFoundException('Comment not found')

    const updated = comment.reply(replyMessage, repliedBy)
    await this.repo.saveComment(updated)
    return updated
  }
}
