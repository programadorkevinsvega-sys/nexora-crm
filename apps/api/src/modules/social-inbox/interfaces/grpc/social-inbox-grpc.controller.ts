import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { ListCommentsUseCase } from '../../application/use-cases/list-comments.use-case'
import { ReplyCommentUseCase } from '../../application/use-cases/reply-comment.use-case'
import { InsertCommentUseCase } from '../../application/use-cases/insert-comment.use-case'
import { UpdateCommentBotUseCase } from '../../application/use-cases/update-comment-bot.use-case'
import { ListRulesUseCase } from '../../application/use-cases/list-rules.use-case'
import { SaveRuleUseCase } from '../../application/use-cases/save-rule.use-case'
import { DeleteRuleUseCase } from '../../application/use-cases/delete-rule.use-case'
import { GetEnabledRulesForPlatformUseCase } from '../../application/use-cases/get-enabled-rules-for-platform.use-case'
import { AutoCreateContactUseCase } from '../../application/use-cases/auto-create-contact.use-case'

@Controller()
export class SocialInboxGrpcController {
  constructor(
    private readonly listCommentsUseCase: ListCommentsUseCase,
    private readonly replyCommentUseCase: ReplyCommentUseCase,
    private readonly insertCommentUseCase: InsertCommentUseCase,
    private readonly updateCommentBotUseCase: UpdateCommentBotUseCase,
    private readonly listRulesUseCase: ListRulesUseCase,
    private readonly saveRuleUseCase: SaveRuleUseCase,
    private readonly deleteRuleUseCase: DeleteRuleUseCase,
    private readonly getEnabledRulesForPlatformUseCase: GetEnabledRulesForPlatformUseCase,
    private readonly autoCreateContactUseCase: AutoCreateContactUseCase,
  ) {}

  @GrpcMethod('SocialInboxService', 'ListComments')
  async listComments(data: { tenantId: string; platform?: string; status?: string }) {
    const comments = await this.listCommentsUseCase.execute(data.tenantId, data.platform, data.status)
    return { jsonItems: comments.map(c => JSON.stringify(this.mapComment(c))) }
  }

  @GrpcMethod('SocialInboxService', 'ReplyComment')
  async replyComment(data: { tenantId: string; commentId: string; replyMessage: string; repliedBy: string }) {
    const comment = await this.replyCommentUseCase.execute(data.tenantId, data.commentId, data.replyMessage, data.repliedBy)
    return { json: JSON.stringify(this.mapComment(comment)) }
  }

  @GrpcMethod('SocialInboxService', 'InsertComment')
  async insertComment(data: { jsonInput: string }) {
    const input = JSON.parse(data.jsonInput)
    if (input.repliedAt) input.repliedAt = new Date(input.repliedAt)
    const comment = await this.insertCommentUseCase.execute(input)
    return { json: JSON.stringify(this.mapComment(comment)) }
  }

  @GrpcMethod('SocialInboxService', 'UpdateCommentBot')
  async updateCommentBot(data: { tenantId: string; commentId: string; replyMessage: string; repliedBy: string; repliedAt: string }) {
    const comment = await this.updateCommentBotUseCase.execute(
      data.tenantId, data.commentId, data.replyMessage, data.repliedBy, new Date(data.repliedAt)
    )
    return { json: JSON.stringify(this.mapComment(comment)) }
  }

  @GrpcMethod('SocialInboxService', 'ListRules')
  async listRules(data: { tenantId: string }) {
    const rules = await this.listRulesUseCase.execute(data.tenantId)
    return { jsonItems: rules.map(r => JSON.stringify(this.mapRule(r))) }
  }

  @GrpcMethod('SocialInboxService', 'SaveRule')
  async saveRule(data: { jsonInput: string }) {
    const input = JSON.parse(data.jsonInput)
    const rule = await this.saveRuleUseCase.execute(input)
    return { json: JSON.stringify(this.mapRule(rule)) }
  }

  @GrpcMethod('SocialInboxService', 'DeleteRule')
  async deleteRule(data: { tenantId: string; id: string }) {
    await this.deleteRuleUseCase.execute(data.tenantId, data.id)
    return {}
  }

  @GrpcMethod('SocialInboxService', 'GetEnabledRulesForPlatform')
  async getEnabledRulesForPlatform(data: { tenantId: string; platform: string }) {
    const rules = await this.getEnabledRulesForPlatformUseCase.execute(data.tenantId, data.platform)
    return { jsonItems: rules.map(r => JSON.stringify(this.mapRule(r))) }
  }

  @GrpcMethod('SocialInboxService', 'AutoCreateContact')
  async autoCreateContact(data: { tenantId: string; authorName: string; platform: string }) {
    await this.autoCreateContactUseCase.execute(data.tenantId, data.authorName, data.platform)
    return {}
  }

  private mapComment(c: any) {
    return {
      ...c,
      repliedAt: c.repliedAt?.toISOString(),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }
  }

  private mapRule(r: any) {
    return {
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }
  }
}
