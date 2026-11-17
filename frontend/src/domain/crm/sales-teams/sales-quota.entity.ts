import { Entity } from "../common/entities/base.entity"

export interface SalesQuotaProps {
  tenantId: string
  userId: string
  teamId: string | null
  periodMonth: number
  periodYear: number
  targetAmount: number
  achievedAmount: number | null
}

export class SalesQuota extends Entity<SalesQuotaProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get userId(): string {
    return this.props.userId
  }

  get teamId(): string | null {
    return this.props.teamId
  }

  get periodMonth(): number {
    return this.props.periodMonth
  }

  get periodYear(): number {
    return this.props.periodYear
  }

  get targetAmount(): number {
    return this.props.targetAmount
  }

  get achievedAmount(): number | null {
    return this.props.achievedAmount
  }

  static create(
    props: SalesQuotaCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): SalesQuota {
    return new SalesQuota(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      userId: props.userId,
      teamId: props.teamId ?? null,
      periodMonth: props.periodMonth,
      periodYear: props.periodYear,
      targetAmount: props.targetAmount,
      achievedAmount: props.achievedAmount ?? null,
    })
  }
}

export interface SalesQuotaCreateInput {
  tenantId: string
  userId: string
  periodMonth: number
  periodYear: number
  targetAmount: number
  teamId?: string | null
  achievedAmount?: number | null
}
