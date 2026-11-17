import { Entity } from "../common/entities/base.entity"

export interface PayoutProps {
  tenantId: string
  affiliateId: string
  amount: number
  paymentMethod: string | null
  paymentReference: string | null
  status: string
  paidAt: string | null
}

export class AffiliatePayout extends Entity<PayoutProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get affiliateId(): string {
    return this.props.affiliateId
  }

  get amount(): number {
    return this.props.amount
  }

  get paymentMethod(): string | null {
    return this.props.paymentMethod
  }

  get paymentReference(): string | null {
    return this.props.paymentReference
  }

  get status(): string {
    return this.props.status
  }

  get paidAt(): string | null {
    return this.props.paidAt
  }

  static create(
    props: PayoutCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): AffiliatePayout {
    return new AffiliatePayout(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      affiliateId: props.affiliateId,
      amount: props.amount,
      paymentMethod: props.paymentMethod ?? null,
      paymentReference: props.paymentReference ?? null,
      status: props.status ?? "PENDING",
      paidAt: props.paidAt ?? null,
    })
  }
}

export interface PayoutCreateInput {
  tenantId: string
  affiliateId: string
  amount: number
  paymentMethod?: string | null
  paymentReference?: string | null
  status?: string
  paidAt?: string | null
}
