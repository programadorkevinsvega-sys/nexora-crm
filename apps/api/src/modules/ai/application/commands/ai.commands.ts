import { MessageChannel, MessageTone, MessageObjective } from '../../domain/entities/generated-draft.entity'

export class GenerateMessageDraftCommand {
  constructor(
    readonly tenantId: string,
    readonly channel: MessageChannel,
    readonly tone: MessageTone,
    readonly objective: MessageObjective,
    readonly contactId?: string,
    readonly dealId?: string,
    readonly customInstructions?: string,
  ) {}
}
