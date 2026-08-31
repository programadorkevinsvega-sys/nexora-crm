import { Entity } from "../common/entities/base.entity"

export interface CampaignProps {
  tenantId: string
  name: string
  type: string | null
  status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED"
  startDate: string | null
  endDate: string | null
  budgetedCost: number | null
  actualCost: number | null
  expectedRevenue: number | null
}

export class Campaign extends Entity<CampaignProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get name(): string {
    return this.props.name
  }

  get type(): string | null {
    return this.props.type
  }

  get status(): "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED" {
    return this.props.status
  }

  get startDate(): string | null {
    return this.props.startDate
  }

  get endDate(): string | null {
    return this.props.endDate
  }

  get budgetedCost(): number | null {
    return this.props.budgetedCost
  }

  get actualCost(): number | null {
    return this.props.actualCost
  }

  get expectedRevenue(): number | null {
    return this.props.expectedRevenue
  }

  static create(
    props: CampaignCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): Campaign {
    return new Campaign(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      name: props.name,
      type: props.type ?? null,
      status: props.status ?? "PLANNED",
      startDate: props.startDate ?? null,
      endDate: props.endDate ?? null,
      budgetedCost: props.budgetedCost ?? null,
      actualCost: props.actualCost ?? null,
      expectedRevenue: props.expectedRevenue ?? null,
    })
  }

  update(input: CampaignUpdateInput): void {
    if (input.name !== undefined) {
      this.props.name = input.name
    }
    if (input.type !== undefined) {
      this.props.type = input.type
    }
    if (input.status !== undefined) {
      this.props.status = input.status
    }
    if (input.startDate !== undefined) {
      this.props.startDate = input.startDate
    }
    if (input.endDate !== undefined) {
      this.props.endDate = input.endDate
    }
    if (input.budgetedCost !== undefined) {
      this.props.budgetedCost = input.budgetedCost
    }
    if (input.actualCost !== undefined) {
      this.props.actualCost = input.actualCost
    }
    if (input.expectedRevenue !== undefined) {
      this.props.expectedRevenue = input.expectedRevenue
    }
    this.touch()
  }
}

export interface CampaignCreateInput {
  tenantId: string
  name: string
  type?: string | null
  status?: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED"
  startDate?: string | null
  endDate?: string | null
  budgetedCost?: number | null
  actualCost?: number | null
  expectedRevenue?: number | null
}

export interface CampaignUpdateInput {
  name?: string
  type?: string | null
  status?: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED"
  startDate?: string | null
  endDate?: string | null
  budgetedCost?: number | null
  actualCost?: number | null
  expectedRevenue?: number | null
}
