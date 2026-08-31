export type CampaignMemberStatus = 'SENT' | 'OPENED' | 'CLICKED' | 'RESPONDED' | 'BOUNCED' | 'UNSUBSCRIBED'

export class CampaignMember {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly campaignId: string,
    readonly contactId: string,
    readonly status: CampaignMemberStatus,
    readonly respondedAt: Date | null,
    readonly createdAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    campaignId: string
    contactId: string
    status?: CampaignMemberStatus
  }): CampaignMember {
    return new CampaignMember(
      crypto.randomUUID(),
      props.tenantId,
      props.campaignId,
      props.contactId,
      props.status ?? 'SENT',
      null,
      new Date(),
    )
  }
}
