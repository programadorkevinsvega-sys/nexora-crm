import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { QuoteRepository } from "@/src/domain/crm/contracts/quote.repository"

export class DeleteQuoteUseCase {
  constructor(private repository: QuoteRepository) {}

  async execute(id: string): Promise<Result<void>> {
    try {
      await this.repository.delete(id)
      return success(undefined as unknown as void)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
