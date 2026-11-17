import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { MailboxRepository } from "@/src/domain/crm/helpdesk/mailbox.repository"
import type { Mailbox, MailboxCreateInput } from "@/src/domain/crm/helpdesk/mailbox.entity"

export class CreateMailboxUseCase {
  constructor(private repository: MailboxRepository) {}

  async execute(data: MailboxCreateInput): Promise<Result<Mailbox>> {
    try {
      const mailbox = await this.repository.create(data)
      return success(mailbox)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
