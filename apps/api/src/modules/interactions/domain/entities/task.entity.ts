export class Task {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly contactId: string | null,
    readonly companyId: string | null,
    readonly dealId: string | null,
    readonly title: string,
    readonly description: string | null,
    readonly dueDate: Date,
    readonly isCompleted: boolean,
    readonly assignedUserId: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    title: string
    dueDate: Date
    assignedUserId: string
    contactId?: string
    companyId?: string
    dealId?: string
    description?: string
    isCompleted?: boolean
  }): Task {
    return new Task(
      crypto.randomUUID(),
      props.tenantId,
      props.contactId ?? null,
      props.companyId ?? null,
      props.dealId ?? null,
      props.title,
      props.description ?? null,
      props.dueDate,
      props.isCompleted ?? false,
      props.assignedUserId,
      new Date(),
      new Date(),
    )
  }

  update(props: {
    title?: string
    description?: string | null
    dueDate?: Date
    isCompleted?: boolean
    contactId?: string | null
    companyId?: string | null
    dealId?: string | null
    assignedUserId?: string
  }): Task {
    return new Task(
      this.id,
      this.tenantId,
      props.contactId !== undefined ? props.contactId : this.contactId,
      props.companyId !== undefined ? props.companyId : this.companyId,
      props.dealId !== undefined ? props.dealId : this.dealId,
      props.title ?? this.title,
      props.description !== undefined ? props.description : this.description,
      props.dueDate ?? this.dueDate,
      props.isCompleted ?? this.isCompleted,
      props.assignedUserId ?? this.assignedUserId,
      this.createdAt,
      new Date(),
    )
  }
}
