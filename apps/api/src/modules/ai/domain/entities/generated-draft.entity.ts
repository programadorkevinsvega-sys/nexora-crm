export type MessageChannel = 'EMAIL' | 'WHATSAPP' | 'NOTE'
export type MessageTone = 'FORMAL' | 'FRIENDLY' | 'PERSUASIVE' | 'URGENT'
export type MessageObjective =
  | 'FOLLOW_UP'
  | 'PROPOSAL_INTRODUCTION'
  | 'CONTRACT_SIGNING'
  | 'PAYMENT_REMINDER'
  | 'RE_ENGAGEMENT'

export class GeneratedDraft {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly contactId: string | null,
    readonly dealId: string | null,
    readonly channel: MessageChannel,
    readonly tone: MessageTone,
    readonly objective: MessageObjective,
    readonly subject: string | null,
    readonly bodyText: string,
    readonly tokensEstimated: number,
    readonly createdAt: Date,
  ) {}
}
