import { Entity } from "../common/entities/base.entity"

export interface DebtProps {
  tenantId: string
  contactId: string
  direction: "OWES_ME" | "I_OWE"
  amount: number
  reason: string
  status: "UNPAID" | "PAID" | "FORGIVEN"
  dueDate: string | null
}

export class Debt extends Entity<DebtProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get contactId(): string {
    return this.props.contactId
  }

  get direction(): "OWES_ME" | "I_OWE" {
    return this.props.direction
  }

  get amount(): number {
    return this.props.amount
  }

  get reason(): string {
    return this.props.reason
  }

  get status(): "UNPAID" | "PAID" | "FORGIVEN" {
    return this.props.status
  }

  get dueDate(): string | null {
    return this.props.dueDate
  }

  static create(
    props: DebtCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): Debt {
    return new Debt(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      contactId: props.contactId,
      direction: props.direction,
      amount: props.amount,
      reason: props.reason,
      status: props.status ?? "UNPAID",
      dueDate: props.dueDate ?? null,
    })
  }

  settle(): void {
    this.props.status = "PAID"
    this.touch()
  }
}

export interface DebtCreateInput {
  tenantId: string
  contactId: string
  direction: "OWES_ME" | "I_OWE"
  amount: number
  reason: string
  status?: "UNPAID" | "PAID" | "FORGIVEN"
  dueDate?: string | null
}
