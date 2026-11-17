import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { ReminderRepository } from "@/src/domain/crm/personal-crm/reminder.repository"
import type { Reminder } from "@/src/domain/crm/personal-crm/reminder.entity"

export class ListRemindersUseCase {
  constructor(private repository: ReminderRepository) {}

  async execute(contactId: string, pagination?: Pagination): Promise<Result<PaginatedResult<Reminder>>> {
    try {
      const result = await this.repository.listByContactId(contactId, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
