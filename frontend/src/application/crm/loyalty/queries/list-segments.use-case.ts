import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { CustomerSegmentRepository } from "@/src/domain/crm/loyalty/customer-segment.repository"
import type { CustomerSegment } from "@/src/domain/crm/loyalty/customer-segment.entity"

export class ListSegmentsUseCase {
  constructor(private repository: CustomerSegmentRepository) {}

  async execute(): Promise<Result<PaginatedResult<CustomerSegment>>> {
    try {
      const result = await this.repository.list()
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
