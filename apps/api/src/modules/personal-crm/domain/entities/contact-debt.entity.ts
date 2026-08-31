export type DebtDirection = 'OWES_ME' | 'I_OWE'
export type DebtStatus = 'UNPAID' | 'PAID' | 'FORGIVEN'

export class ContactDebt {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly contactId: string,
    readonly direction: DebtDirection,
    readonly amount: number,
    readonly reason: string,
    readonly status: DebtStatus,
    readonly dueDate: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    contactId: string
    direction: DebtDirection
    amount: number
    reason: string
    status?: DebtStatus
    dueDate?: string
  }): ContactDebt {
    return new ContactDebt(
      crypto.randomUUID(),
      props.tenantId,
      props.contactId,
      props.direction,
      props.amount,
      props.reason,
      props.status ?? 'UNPAID',
      props.dueDate ?? null,
      new Date(),
      new Date(),
    )
  }

  settle(): ContactDebt {
    return new ContactDebt(
      this.id,
      this.tenantId,
      this.contactId,
      this.direction,
      this.amount,
      this.reason,
      'PAID',
      this.dueDate,
      this.createdAt,
      new Date(),
    )
  }
}
