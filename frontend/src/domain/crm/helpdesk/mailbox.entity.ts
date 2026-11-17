import { Entity } from "../common/entities/base.entity"

export interface MailboxProps {
  tenantId: string
  name: string
  emailAddress: string
  isActive: boolean
}

export class Mailbox extends Entity<MailboxProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get name(): string {
    return this.props.name
  }

  get emailAddress(): string {
    return this.props.emailAddress
  }

  get isActive(): boolean {
    return this.props.isActive
  }

  static create(
    props: MailboxCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): Mailbox {
    return new Mailbox(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      name: props.name,
      emailAddress: props.emailAddress,
      isActive: props.isActive ?? true,
    })
  }

  update(input: MailboxUpdateInput): void {
    if (input.name !== undefined) {
      this.props.name = input.name
    }
    if (input.emailAddress !== undefined) {
      this.props.emailAddress = input.emailAddress
    }
    if (input.isActive !== undefined) {
      this.props.isActive = input.isActive
    }
    this.touch()
  }
}

export interface MailboxCreateInput {
  tenantId: string
  name: string
  emailAddress: string
  isActive?: boolean
}

export interface MailboxUpdateInput {
  name?: string
  emailAddress?: string
  isActive?: boolean
}
