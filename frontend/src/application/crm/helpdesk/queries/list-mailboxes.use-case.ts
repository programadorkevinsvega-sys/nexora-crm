import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { MailboxRepository } from "@/src/domain/crm/helpdesk/mailbox.repository"
import type { Mailbox } from "@/src/domain/crm/helpdesk/mailbox.entity"

export class ListMailboxesUseCase {
  constructor(private repository: MailboxRepository) {}

  async execute(): Promise<Result<PaginatedResult<Mailbox>>> {
    try {
      const result = await this.repository.list()
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
