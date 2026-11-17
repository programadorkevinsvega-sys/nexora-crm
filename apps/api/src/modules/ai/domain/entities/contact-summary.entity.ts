export type RelationshipSentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'

export class ContactExecutiveSummary {
  constructor(
    readonly contactId: string,
    readonly contactName: string,
    readonly summary: string,
    readonly sentiment: RelationshipSentiment,
    readonly keyPainPoints: string[],
    readonly recommendedStrategy: string,
    readonly generatedAt: Date,
  ) {}
}
