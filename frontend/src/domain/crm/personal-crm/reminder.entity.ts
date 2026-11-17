import { Entity } from "../common/entities/base.entity"

export interface ReminderProps {
  tenantId: string
  contactId: string
  title: string
  description: string | null
  frequencyType: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM"
  frequencyInterval: number | null
  nextDueDate: string | null
  isActive: boolean
}

export class Reminder extends Entity<ReminderProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get contactId(): string {
    return this.props.contactId
  }

  get title(): string {
    return this.props.title
  }

  get description(): string | null {
    return this.props.description
  }

  get frequencyType(): "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM" {
    return this.props.frequencyType
  }

  get frequencyInterval(): number | null {
    return this.props.frequencyInterval
  }

  get nextDueDate(): string | null {
    return this.props.nextDueDate
  }

  get isActive(): boolean {
    return this.props.isActive
  }

  static create(
    props: ReminderCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): Reminder {
    return new Reminder(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      contactId: props.contactId,
      title: props.title,
      description: props.description ?? null,
      frequencyType: props.frequencyType ?? "DAILY",
      frequencyInterval: props.frequencyInterval ?? null,
      nextDueDate: props.nextDueDate ?? null,
      isActive: props.isActive ?? true,
    })
  }

  toggle(): void {
    this.props.isActive = !this.props.isActive
    this.touch()
  }
}

export interface ReminderCreateInput {
  tenantId: string
  contactId: string
  title: string
  description?: string | null
  frequencyType?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM"
  frequencyInterval?: number | null
  nextDueDate?: string | null
  isActive?: boolean
}
