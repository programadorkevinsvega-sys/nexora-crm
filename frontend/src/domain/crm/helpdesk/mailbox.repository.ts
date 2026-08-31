import type { PaginatedResult } from "../common/results/paginated-result"
import type { Mailbox, MailboxCreateInput, MailboxUpdateInput } from "./mailbox.entity"

export interface MailboxRepository {
  list(): Promise<PaginatedResult<Mailbox>>
  create(data: MailboxCreateInput): Promise<Mailbox>
  update(id: string, data: MailboxUpdateInput): Promise<Mailbox>
}
