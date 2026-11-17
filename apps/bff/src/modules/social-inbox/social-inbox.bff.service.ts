import { Injectable, Logger } from '@nestjs/common'
import type {
  SocialComment,
  SocialAutoResponderRule,
  CreateSocialReplyDto,
  SimulateCommentDto,
} from '@crm/contracts'
import { RagService } from '../ai/rag/rag.service'
import { SocialInboxCommentsService } from './social-inbox-comments.service'
import { SocialInboxRulesService } from './social-inbox-rules.service'

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001'

@Injectable()
export class SocialInboxBffService {
  private readonly logger = new Logger(SocialInboxBffService.name)

  constructor(
    private readonly ragService: RagService,
    private readonly commentsService: SocialInboxCommentsService,
    private readonly rulesService: SocialInboxRulesService,
  ) {}

  async listComments(tenantId?: string, platform?: string, status?: string): Promise<SocialComment[]> {
    return this.commentsService.listComments(tenantId, platform, status)
  }

  async replyComment(dto: CreateSocialReplyDto, tenantId?: string): Promise<SocialComment> {
    return this.commentsService.replyComment(dto, tenantId)
  }

  async listRules(tenantId?: string): Promise<SocialAutoResponderRule[]> {
    return this.rulesService.listRules(tenantId)
  }

  async saveRule(dto: Partial<SocialAutoResponderRule>, tenantId?: string): Promise<SocialAutoResponderRule> {
    return this.rulesService.saveRule(dto, tenantId)
  }

  async deleteRule(ruleId: string, tenantId?: string): Promise<{ success: boolean }> {
    return this.rulesService.deleteRule(ruleId, tenantId)
  }

  async simulateComment(dto: SimulateCommentDto, tenantId?: string): Promise<{
    comment: SocialComment
    matchedRule?: SocialAutoResponderRule | null
    autoReplied: boolean
  }> {
    const tid = tenantId || DEFAULT_TENANT_ID
    const now = new Date()

    // Insert real comment into DB
    const newComment = await this.commentsService.insertComment({
      tenantId: tid,
      platform: dto.platform,
      postType: dto.postType,
      postId: `post_${Date.now()}`,
      postTitle: dto.postTitle,
      authorId: `usr_${Date.now()}`,
      authorName: dto.authorName,
      commentId: `ext_cm_${Date.now()}`,
      message: dto.message,
      sentiment: dto.message.includes('?') ? 'QUESTION' : 'NEUTRAL',
      status: 'PENDING',
    })

    // Match rules from DB
    const rules = await this.rulesService.getEnabledRulesForPlatform(tid, dto.platform)
    const msgLower = dto.message.toLowerCase()
    let matchedRule: SocialAutoResponderRule | null = null

    for (const rule of rules) {
      const match = rule.triggerKeywords.length === 0
        || rule.triggerKeywords.some((k) => msgLower.includes(k.toLowerCase().trim()))
      if (match) { matchedRule = rule; break }
    }

    let replyMessage: string | undefined
    let repliedBy: string | undefined

    if (matchedRule) {
      if (matchedRule.responseMode === 'AI_BOT') {
        const ragRes = await this.ragService.generateGroundedReply(tid, {
          query: dto.message,
          authorName: dto.authorName,
          platform: dto.platform,
          customPrompt: matchedRule.aiPrompt,
        })
        replyMessage = ragRes.replyText
        repliedBy = 'AI_BOT'
      } else {
        const pool = matchedRule.staticReplies.length > 0
          ? matchedRule.staticReplies
          : ['¡Hola {name}! Gracias por tu mensaje.']
        replyMessage = pool[Math.floor(Math.random() * pool.length)].replace(/\{name\}/g, dto.authorName)
        repliedBy = 'AUTO_RULE'
      }

      // Update comment with bot reply
      const replied = await this.commentsService.updateCommentBot(
        newComment.id, tid, replyMessage!, repliedBy!, now,
      )

      if (matchedRule.autoCreateLead) {
        await this.commentsService.autoCreateContact(dto.authorName, dto.platform, tid)
      }

      return { comment: replied, matchedRule, autoReplied: true }
    }

    return { comment: newComment, matchedRule: null, autoReplied: false }
  }
}
