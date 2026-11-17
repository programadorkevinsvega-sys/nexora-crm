import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { IDealRepository } from "@/src/domain/crm/deals/deal.repository"
import type { Deal, DealCreateInput } from "@/src/domain/crm/deals/deal.entity"

export class CreateDealUseCase {
  constructor(private repository: IDealRepository) {}

  async execute(data: DealCreateInput): Promise<Result<Deal>> {
    try {
      const deal = await this.repository.create(data)
      return success(deal)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
