import { HelpdeskMailbox } from '../../domain/entities/mailbox.entity'

type MailboxRow = {
  id: string
  tenantId: string
  name: string
  emailAddress: string
  isActive: boolean | null
  createdAt: Date
  updatedAt: Date
}

export class MailboxMapper {
  static toDomain(row: MailboxRow): HelpdeskMailbox {
    return new HelpdeskMailbox(
      row.id,
      row.tenantId,
      row.name,
      row.emailAddress,
      row.isActive ?? false,
      row.createdAt,
      row.updatedAt,
    )
  }

  static toPersistence(mailbox: HelpdeskMailbox): MailboxRow {
    return {
      id: mailbox.id,
      tenantId: mailbox.tenantId,
      name: mailbox.name,
      emailAddress: mailbox.emailAddress,
      isActive: mailbox.isActive,
      createdAt: mailbox.createdAt,
      updatedAt: mailbox.updatedAt,
    }
  }

  static toResponse(mailbox: HelpdeskMailbox) {
    return {
      id: mailbox.id,
      name: mailbox.name,
      emailAddress: mailbox.emailAddress,
      isActive: mailbox.isActive,
      createdAt: mailbox.createdAt.toISOString(),
      updatedAt: mailbox.updatedAt.toISOString(),
    }
  }
}
