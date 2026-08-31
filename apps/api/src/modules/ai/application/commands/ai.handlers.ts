import { Injectable } from '@nestjs/common'
import { GenerateMessageDraftCommand } from './ai.commands'
import { AiRepository } from '../../domain/repositories/ai.repository'
import { GeneratedDraft } from '../../domain/entities/generated-draft.entity'

@Injectable()
export class GenerateMessageDraftHandler {
  constructor(private readonly repo: AiRepository) {}

  async execute(command: GenerateMessageDraftCommand): Promise<GeneratedDraft> {
    return this.repo.generateMessageDraft(command.tenantId, {
      contactId: command.contactId,
      dealId: command.dealId,
      channel: command.channel,
      tone: command.tone,
      objective: command.objective,
      customInstructions: command.customInstructions,
    })
  }
}
