import { Entity } from "../common/entities/base.entity"

export interface LifeEventProps {
  tenantId: string
  contactId: string
  eventType: string
  name: string
  description: string | null
  happenedAt: string | null
  isYearlyRecurring: boolean
}

export class LifeEvent extends Entity<LifeEventProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get contactId(): string {
    return this.props.contactId
  }

  get eventType(): string {
    return this.props.eventType
  }

  get name(): string {
    return this.props.name
  }

  get description(): string | null {
    return this.props.description
  }

  get happenedAt(): string | null {
    return this.props.happenedAt
  }

  get isYearlyRecurring(): boolean {
    return this.props.isYearlyRecurring
  }

  static create(
    props: LifeEventCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): LifeEvent {
    return new LifeEvent(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      contactId: props.contactId,
      eventType: props.eventType,
      name: props.name,
      description: props.description ?? null,
      happenedAt: props.happenedAt ?? null,
      isYearlyRecurring: props.isYearlyRecurring ?? false,
    })
  }
}

export interface LifeEventCreateInput {
  tenantId: string
  contactId: string
  eventType: string
  name: string
  description?: string | null
  happenedAt?: string | null
  isYearlyRecurring?: boolean
}
