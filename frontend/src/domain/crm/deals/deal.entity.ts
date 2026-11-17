import { Entity } from "../common/entities/base.entity"

export interface DealProps {
  tenantId: string
  pipelineId: string
  stageId: string
  name: string
  value: number | null
  currency: string | null
  probability: number | null
  status: "OPEN" | "WON" | "LOST"
  contactId: string | null
  companyId: string | null
  ownerUserId: string | null
  closeDate: string | null
}

export class Deal extends Entity<DealProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get pipelineId(): string {
    return this.props.pipelineId
  }

  get stageId(): string {
    return this.props.stageId
  }

  get name(): string {
    return this.props.name
  }

  get value(): number | null {
    return this.props.value
  }

  get currency(): string | null {
    return this.props.currency
  }

  get probability(): number | null {
    return this.props.probability
  }

  get status(): "OPEN" | "WON" | "LOST" {
    return this.props.status
  }

  get contactId(): string | null {
    return this.props.contactId
  }

  get companyId(): string | null {
    return this.props.companyId
  }

  get ownerUserId(): string | null {
    return this.props.ownerUserId
  }

  get closeDate(): string | null {
    return this.props.closeDate
  }

  static create(
    props: DealCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): Deal {
    return new Deal(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      pipelineId: props.pipelineId,
      stageId: props.stageId,
      name: props.name,
      value: props.value ?? null,
      currency: props.currency ?? null,
      probability: props.probability ?? null,
      status: "OPEN",
      contactId: props.contactId ?? null,
      companyId: props.companyId ?? null,
      ownerUserId: props.ownerUserId ?? null,
      closeDate: props.closeDate ?? null,
    })
  }

  update(input: DealUpdateInput): void {
    if (input.name !== undefined) {
      this.props.name = input.name
    }
    if (input.stageId !== undefined) {
      this.props.stageId = input.stageId
    }
    if (input.value !== undefined) {
      this.props.value = input.value
    }
    if (input.currency !== undefined) {
      this.props.currency = input.currency
    }
    if (input.probability !== undefined) {
      this.props.probability = input.probability
    }
    if (input.contactId !== undefined) {
      this.props.contactId = input.contactId
    }
    if (input.companyId !== undefined) {
      this.props.companyId = input.companyId
    }
    if (input.ownerUserId !== undefined) {
      this.props.ownerUserId = input.ownerUserId
    }
    if (input.closeDate !== undefined) {
      this.props.closeDate = input.closeDate
    }
    this.touch()
  }

  moveToStage(stageId: string): void {
    this.props.stageId = stageId
    this.touch()
  }

  win(): void {
    this.props.status = "WON"
    this.touch()
  }

  lose(): void {
    this.props.status = "LOST"
    this.touch()
  }
}

export interface DealCreateInput {
  tenantId: string
  pipelineId: string
  stageId: string
  name: string
  value?: number | null
  currency?: string | null
  probability?: number | null
  contactId?: string | null
  companyId?: string | null
  ownerUserId?: string | null
  closeDate?: string | null
}

export interface DealUpdateInput {
  name?: string
  stageId?: string
  value?: number | null
  currency?: string | null
  probability?: number | null
  contactId?: string | null
  companyId?: string | null
  ownerUserId?: string | null
  closeDate?: string | null
}
