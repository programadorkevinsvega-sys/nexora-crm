import { Entity } from "../common/entities/base.entity"

export interface AffiliateProps {
  tenantId: string
  programId: string
  customerId: string
  referralCode: string
  referralLink: string
  parentAffiliateId: string | null
  mlmLevel: number | null
  status: string
}

export class Affiliate extends Entity<AffiliateProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get programId(): string {
    return this.props.programId
  }

  get customerId(): string {
    return this.props.customerId
  }

  get referralCode(): string {
    return this.props.referralCode
  }

  get referralLink(): string {
    return this.props.referralLink
  }

  get parentAffiliateId(): string | null {
    return this.props.parentAffiliateId
  }

  get mlmLevel(): number | null {
    return this.props.mlmLevel
  }

  get status(): string {
    return this.props.status
  }

  static create(
    props: AffiliateCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): Affiliate {
    return new Affiliate(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      programId: props.programId,
      customerId: props.customerId,
      referralCode: props.referralCode,
      referralLink: props.referralLink,
      parentAffiliateId: props.parentAffiliateId ?? null,
      mlmLevel: props.mlmLevel ?? null,
      status: props.status ?? "ACTIVE",
    })
  }
}

export interface AffiliateCreateInput {
  tenantId: string
  programId: string
  customerId: string
  referralCode: string
  referralLink: string
  parentAffiliateId?: string | null
  mlmLevel?: number | null
  status?: string
}
