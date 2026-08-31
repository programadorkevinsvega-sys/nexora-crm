import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { LifeEventRepository } from "@/src/domain/crm/personal-crm/life-event.repository"
import type { LifeEvent } from "@/src/domain/crm/personal-crm/life-event.entity"

export class ListLifeEventsUseCase {
  constructor(private repository: LifeEventRepository) {}

  async execute(contactId: string, pagination?: Pagination): Promise<Result<PaginatedResult<LifeEvent>>> {
    try {
      const result = await this.repository.listByContactId(contactId, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
