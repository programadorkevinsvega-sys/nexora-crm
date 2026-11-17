import { Entity } from "../common/entities/base.entity"

export interface CampaignMemberProps {
  tenantId: string
  campaignId: string
  contactId: string
  status: "SENT" | "OPENED" | "CLICKED" | "RESPONDED" | "BOUNCED" | "UNSUBSCRIBED"
  respondedAt: string | null
}

export class CampaignMember extends Entity<CampaignMemberProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get campaignId(): string {
    return this.props.campaignId
  }

  get contactId(): string {
    return this.props.contactId
  }

  get status(): "SENT" | "OPENED" | "CLICKED" | "RESPONDED" | "BOUNCED" | "UNSUBSCRIBED" {
    return this.props.status
  }

  get respondedAt(): string | null {
    return this.props.respondedAt
  }

  static create(
    props: CampaignMemberCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): CampaignMember {
    return new CampaignMember(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      campaignId: props.campaignId,
      contactId: props.contactId,
      status: props.status ?? "SENT",
      respondedAt: props.respondedAt ?? null,
    })
  }
}

export interface CampaignMemberCreateInput {
  tenantId: string
  campaignId: string
  contactId: string
  status?: "SENT" | "OPENED" | "CLICKED" | "RESPONDED" | "BOUNCED" | "UNSUBSCRIBED"
  respondedAt?: string | null
}
