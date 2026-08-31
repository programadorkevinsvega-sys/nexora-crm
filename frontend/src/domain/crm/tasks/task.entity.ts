import { Entity } from "../common/entities/base.entity"

export interface TaskProps {
  tenantId: string
  contactId: string | null
  companyId: string | null
  dealId: string | null
  title: string
  description: string | null
  dueDate: string
  isCompleted: boolean
  assignedUserId: string
}

export class Task extends Entity<TaskProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get contactId(): string | null {
    return this.props.contactId
  }

  get companyId(): string | null {
    return this.props.companyId
  }

  get dealId(): string | null {
    return this.props.dealId
  }

  get title(): string {
    return this.props.title
  }

  get description(): string | null {
    return this.props.description
  }

  get dueDate(): string {
    return this.props.dueDate
  }

  get isCompleted(): boolean {
    return this.props.isCompleted
  }

  get assignedUserId(): string {
    return this.props.assignedUserId
  }

  static create(
    props: TaskCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): Task {
    return new Task(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      contactId: props.contactId ?? null,
      companyId: props.companyId ?? null,
      dealId: props.dealId ?? null,
      title: props.title,
      description: props.description ?? null,
      dueDate: props.dueDate,
      isCompleted: props.isCompleted ?? false,
      assignedUserId: props.assignedUserId,
    })
  }

  complete(): void {
    this.props.isCompleted = true
    this.touch()
  }

  reopen(): void {
    this.props.isCompleted = false
    this.touch()
  }

  update(input: TaskUpdateInput): void {
    if (input.title !== undefined) {
      this.props.title = input.title
    }
    if (input.description !== undefined) {
      this.props.description = input.description
    }
    if (input.dueDate !== undefined) {
      this.props.dueDate = input.dueDate
    }
    if (input.contactId !== undefined) {
      this.props.contactId = input.contactId
    }
    if (input.companyId !== undefined) {
      this.props.companyId = input.companyId
    }
    if (input.dealId !== undefined) {
      this.props.dealId = input.dealId
    }
    if (input.assignedUserId !== undefined) {
      this.props.assignedUserId = input.assignedUserId
    }
    this.touch()
  }
}

export interface TaskCreateInput {
  tenantId: string
  title: string
  dueDate: string
  assignedUserId: string
  contactId?: string | null
  companyId?: string | null
  dealId?: string | null
  description?: string | null
  isCompleted?: boolean
}

export interface TaskUpdateInput {
  title?: string
  description?: string | null
  dueDate?: string
  contactId?: string | null
  companyId?: string | null
  dealId?: string | null
  assignedUserId?: string
  isCompleted?: boolean
}
