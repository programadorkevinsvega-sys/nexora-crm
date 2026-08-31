import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { IDealRepository } from "@/src/domain/crm/deals/deal.repository"
import type { Deal } from "@/src/domain/crm/deals/deal.entity"

export class WinDealUseCase {
  constructor(private repository: IDealRepository) {}

  async execute(id: string): Promise<Result<Deal>> {
    try {
      const deal = await this.repository.win(id)
      return success(deal)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
