import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { CustomerSegmentRepository } from "@/src/domain/crm/loyalty/customer-segment.repository"

export class AssignToSegmentUseCase {
  constructor(private repository: CustomerSegmentRepository) {}

  async execute(segmentId: string, contactId: string): Promise<Result<void>> {
    try {
      await this.repository.assignToSegment(segmentId, contactId)
      return success(undefined)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
