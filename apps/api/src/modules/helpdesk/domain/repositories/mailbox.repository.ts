import { HelpdeskMailbox } from '../entities/mailbox.entity'

export abstract class MailboxRepository {
  abstract findById(tenantId: string, id: string): Promise<HelpdeskMailbox | null>
  abstract list(tenantId: string): Promise<HelpdeskMailbox[]>
  abstract save(mailbox: HelpdeskMailbox): Promise<void>
}
