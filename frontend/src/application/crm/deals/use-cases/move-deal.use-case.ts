import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { IDealRepository } from "@/src/domain/crm/deals/deal.repository"
import type { Deal } from "@/src/domain/crm/deals/deal.entity"

export class MoveDealUseCase {
  constructor(private repository: IDealRepository) {}

  async execute(id: string, stageId: string): Promise<Result<Deal>> {
    try {
      const deal = await this.repository.moveToStage(id, stageId)
      return success(deal)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
