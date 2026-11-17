import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { IDealRepository } from "@/src/domain/crm/deals/deal.repository"

export class DeleteDealUseCase {
  constructor(private repository: IDealRepository) {}

  async execute(id: string): Promise<Result<void>> {
    try {
      await this.repository.delete(id)
      return success(undefined)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
