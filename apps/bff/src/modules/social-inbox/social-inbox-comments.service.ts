import { Injectable, Logger } from '@nestjs/common'
import type { SocialComment, CreateSocialReplyDto } from '@crm/contracts'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001'

@Injectable()
export class SocialInboxCommentsService {
  private readonly logger = new Logger(SocialInboxCommentsService.name)

  constructor(private readonly api: ApiCoreGrpcClient) {}

  async listComments(tenantId?: string, platform?: string, status?: string): Promise<SocialComment[]> {
    const tid = tenantId || DEFAULT_TENANT_ID
    return this.api.listComments({ tenantId: tid, platform, status })
  }

  async replyComment(dto: CreateSocialReplyDto, tenantId?: string): Promise<SocialComment> {
    const tid = tenantId || DEFAULT_TENANT_ID
    const updated = await this.api.replyComment({
      tenantId: tid,
      commentId: dto.commentId,
      replyMessage: dto.replyMessage,
      repliedBy: 'AGENT'
    })
    this.logger.log(`Agent replied to comment ${dto.commentId} on ${updated.platform}`)
    return updated
  }

  async insertComment(data: {
    tenantId: string
    platform: string
    postType: string
    postId: string
    postTitle?: string
    authorId: string
    authorName: string
    commentId: string
    message: string
    sentiment?: string
    status?: string
    replyMessage?: string
    repliedAt?: Date
    repliedBy?: string
  }): Promise<SocialComment> {
    return this.api.insertComment(data)
  }

  async updateCommentBot(
    commentId: string, tenantId: string,
    replyMessage: string, repliedBy: string, repliedAt: Date,
  ): Promise<SocialComment> {
    return this.api.updateCommentBot({
      tenantId,
      commentId,
      replyMessage,
      repliedBy,
      repliedAt: repliedAt.toISOString()
    })
  }

  async autoCreateContact(authorName: string, platform: string, tenantId: string): Promise<void> {
    await this.api.autoCreateContact(tenantId, authorName, platform)
  }
}

