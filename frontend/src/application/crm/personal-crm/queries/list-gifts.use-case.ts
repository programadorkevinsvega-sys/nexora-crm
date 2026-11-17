import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { GiftRepository } from "@/src/domain/crm/personal-crm/gift.repository"
import type { Gift } from "@/src/domain/crm/personal-crm/gift.entity"

export class ListGiftsUseCase {
  constructor(private repository: GiftRepository) {}

  async execute(contactId: string, pagination?: Pagination): Promise<Result<PaginatedResult<Gift>>> {
    try {
      const result = await this.repository.listByContactId(contactId, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
