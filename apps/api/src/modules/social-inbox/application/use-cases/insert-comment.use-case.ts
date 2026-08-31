import { Injectable, Inject } from '@nestjs/common'
import { SocialInboxRepository } from '../../domain/repositories/social-inbox.repository'
import { SocialComment } from '../../domain/entities/social-comment.entity'

export type InsertCommentInput = {
  tenantId: string
  platform: string
  postType: string
  postId: string
  postTitle?: string
  authorId: string
  authorName: string
  authorAvatarUrl?: string
  commentId: string
  parentCommentId?: string
  message: string
  sentiment?: string
  status?: string
  replyMessage?: string
  repliedAt?: Date
  repliedBy?: string
}

@Injectable()
export class InsertCommentUseCase {
  constructor(@Inject('SocialInboxRepository') private readonly repo: SocialInboxRepository) {}

  async execute(input: InsertCommentInput): Promise<SocialComment> {
    const comment = SocialComment.create(input)
    await this.repo.saveComment(comment)
    return comment
  }
}
