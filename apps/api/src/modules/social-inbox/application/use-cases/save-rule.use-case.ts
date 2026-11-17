import { Injectable, Inject } from '@nestjs/common'
import { SocialInboxRepository } from '../../domain/repositories/social-inbox.repository'
import { SocialAutoResponderRule } from '../../domain/entities/social-rule.entity'

export type SaveRuleInput = {
  id?: string
  tenantId: string
  name: string
  platform?: string
  triggerKeywords?: string[]
  responseMode?: string
  staticReplies?: string[]
  aiPrompt?: string
  sendPrivateDm?: boolean
  autoCreateLead?: boolean
  pipelineId?: string
  stageId?: string
  isEnabled?: boolean
}

@Injectable()
export class SaveRuleUseCase {
  constructor(@Inject('SocialInboxRepository') private readonly repo: SocialInboxRepository) {}

  async execute(input: SaveRuleInput): Promise<SocialAutoResponderRule> {
    let rule: SocialAutoResponderRule

    if (input.id) {
      const existing = await this.repo.getRule(input.tenantId, input.id)
      if (!existing) throw new Error('Rule not found')
      rule = existing.update({
        name: input.name,
        platform: input.platform,
        triggerKeywords: input.triggerKeywords,
        responseMode: input.responseMode,
        staticReplies: input.staticReplies,
        aiPrompt: input.aiPrompt || null,
        sendPrivateDm: input.sendPrivateDm,
        autoCreateLead: input.autoCreateLead,
        pipelineId: input.pipelineId || null,
        stageId: input.stageId || null,
        isEnabled: input.isEnabled,
      })
    } else {
      rule = SocialAutoResponderRule.create(input)
    }

    await this.repo.saveRule(rule)
    return rule
  }
}
