import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { TagRepository, TagFilters } from "@/src/domain/crm/tags/tag.repository"
import type { Tag } from "@/src/domain/crm/tags/tag.entity"

export class ListTagsUseCase {
  constructor(private repository: TagRepository) {}

  async execute(filters?: TagFilters, pagination?: Pagination): Promise<Result<PaginatedResult<Tag>>> {
    try {
      const result = await this.repository.list(filters, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
