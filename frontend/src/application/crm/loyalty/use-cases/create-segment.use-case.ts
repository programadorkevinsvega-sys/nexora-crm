import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { CustomerSegmentRepository } from "@/src/domain/crm/loyalty/customer-segment.repository"
import type { CustomerSegment, SegmentCreateInput } from "@/src/domain/crm/loyalty/customer-segment.entity"

export class CreateSegmentUseCase {
  constructor(private repository: CustomerSegmentRepository) {}

  async execute(data: SegmentCreateInput): Promise<Result<CustomerSegment>> {
    try {
      const segment = await this.repository.create(data)
      return success(segment)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
