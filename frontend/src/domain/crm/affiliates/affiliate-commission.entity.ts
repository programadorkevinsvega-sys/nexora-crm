import { Entity } from "../common/entities/base.entity"

export interface CommissionProps {
  tenantId: string
  affiliateId: string
  sourceOrderId: string
  commissionAmount: number
  mlmLevelEarned: number | null
  status: string
}

export class AffiliateCommission extends Entity<CommissionProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get affiliateId(): string {
    return this.props.affiliateId
  }

  get sourceOrderId(): string {
    return this.props.sourceOrderId
  }

  get commissionAmount(): number {
    return this.props.commissionAmount
  }

  get mlmLevelEarned(): number | null {
    return this.props.mlmLevelEarned
  }

  get status(): string {
    return this.props.status
  }

  static create(
    props: CommissionCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): AffiliateCommission {
    return new AffiliateCommission(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      affiliateId: props.affiliateId,
      sourceOrderId: props.sourceOrderId,
      commissionAmount: props.commissionAmount,
      mlmLevelEarned: props.mlmLevelEarned ?? null,
      status: props.status ?? "PENDING",
    })
  }
}

export interface CommissionCreateInput {
  tenantId: string
  affiliateId: string
  sourceOrderId: string
  commissionAmount: number
  mlmLevelEarned?: number | null
  status?: string
}
