import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { IDealRepository } from "@/src/domain/crm/deals/deal.repository"
import type { Deal, DealUpdateInput } from "@/src/domain/crm/deals/deal.entity"

export class UpdateDealUseCase {
  constructor(private repository: IDealRepository) {}

  async execute(id: string, data: DealUpdateInput): Promise<Result<Deal>> {
    try {
      const deal = await this.repository.update(id, data)
      return success(deal)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
