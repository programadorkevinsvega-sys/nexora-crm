import { Entity } from "../common/entities/base.entity"

export interface ContractProps {
  tenantId: string
  companyId: string
  dealId: string | null
  name: string
  startDate: string
  endDate: string | null
  autoRenew: boolean
  mrrValue: number | null
  status: "DRAFT" | "ACTIVE" | "EXPIRED" | "CANCELLED" | "RENEWED"
  ownerUserId: string
}

export class Contract extends Entity<ContractProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get companyId(): string {
    return this.props.companyId
  }

  get dealId(): string | null {
    return this.props.dealId
  }

  get name(): string {
    return this.props.name
  }

  get startDate(): string {
    return this.props.startDate
  }

  get endDate(): string | null {
    return this.props.endDate
  }

  get autoRenew(): boolean {
    return this.props.autoRenew
  }

  get mrrValue(): number | null {
    return this.props.mrrValue
  }

  get status(): "DRAFT" | "ACTIVE" | "EXPIRED" | "CANCELLED" | "RENEWED" {
    return this.props.status
  }

  get ownerUserId(): string {
    return this.props.ownerUserId
  }

  static create(
    props: ContractCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): Contract {
    return new Contract(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      companyId: props.companyId,
      dealId: props.dealId ?? null,
      name: props.name,
      startDate: props.startDate,
      endDate: props.endDate ?? null,
      autoRenew: props.autoRenew ?? false,
      mrrValue: props.mrrValue ?? null,
      status: props.status,
      ownerUserId: props.ownerUserId,
    })
  }

  renew(): void {
    this.props.status = "RENEWED"
    this.touch()
  }

  cancel(): void {
    this.props.status = "CANCELLED"
    this.touch()
  }

  activate(): void {
    this.props.status = "ACTIVE"
    this.touch()
  }

  update(input: ContractUpdateInput): void {
    if (input.name !== undefined) {
      this.props.name = input.name
    }
    if (input.startDate !== undefined) {
      this.props.startDate = input.startDate
    }
    if (input.endDate !== undefined) {
      this.props.endDate = input.endDate
    }
    if (input.autoRenew !== undefined) {
      this.props.autoRenew = input.autoRenew
    }
    if (input.mrrValue !== undefined) {
      this.props.mrrValue = input.mrrValue
    }
    if (input.status !== undefined) {
      this.props.status = input.status
    }
    if (input.ownerUserId !== undefined) {
      this.props.ownerUserId = input.ownerUserId
    }
    if (input.dealId !== undefined) {
      this.props.dealId = input.dealId
    }
    this.touch()
  }
}

export interface ContractCreateInput {
  tenantId: string
  companyId: string
  name: string
  startDate: string
  status: "DRAFT" | "ACTIVE" | "EXPIRED" | "CANCELLED" | "RENEWED"
  ownerUserId: string
  dealId?: string | null
  endDate?: string | null
  autoRenew?: boolean
  mrrValue?: number | null
}

export interface ContractUpdateInput {
  name?: string
  startDate?: string
  endDate?: string | null
  autoRenew?: boolean
  mrrValue?: number | null
  status?: "DRAFT" | "ACTIVE" | "EXPIRED" | "CANCELLED" | "RENEWED"
  ownerUserId?: string
  dealId?: string | null
}
