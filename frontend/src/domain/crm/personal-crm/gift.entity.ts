import { Entity } from "../common/entities/base.entity"

export interface GiftProps {
  tenantId: string
  contactId: string
  direction: "GIVEN" | "RECEIVED"
  name: string
  description: string | null
  url: string | null
  estimatedValue: number | null
  status: "IDEA" | "PURCHASED" | "GIVEN" | "RECEIVED"
  dateGivenOrReceived: string | null
}

export class Gift extends Entity<GiftProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get contactId(): string {
    return this.props.contactId
  }

  get direction(): "GIVEN" | "RECEIVED" {
    return this.props.direction
  }

  get name(): string {
    return this.props.name
  }

  get description(): string | null {
    return this.props.description
  }

  get url(): string | null {
    return this.props.url
  }

  get estimatedValue(): number | null {
    return this.props.estimatedValue
  }

  get status(): "IDEA" | "PURCHASED" | "GIVEN" | "RECEIVED" {
    return this.props.status
  }

  get dateGivenOrReceived(): string | null {
    return this.props.dateGivenOrReceived
  }

  static create(
    props: GiftCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): Gift {
    return new Gift(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      contactId: props.contactId,
      direction: props.direction,
      name: props.name,
      description: props.description ?? null,
      url: props.url ?? null,
      estimatedValue: props.estimatedValue ?? null,
      status: props.status ?? "IDEA",
      dateGivenOrReceived: props.dateGivenOrReceived ?? null,
    })
  }
}

export interface GiftCreateInput {
  tenantId: string
  contactId: string
  direction: "GIVEN" | "RECEIVED"
  name: string
  description?: string | null
  url?: string | null
  estimatedValue?: number | null
  status?: "IDEA" | "PURCHASED" | "GIVEN" | "RECEIVED"
  dateGivenOrReceived?: string | null
}
