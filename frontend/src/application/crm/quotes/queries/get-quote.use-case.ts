import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { QuoteRepository } from "@/src/domain/crm/contracts/quote.repository"
import type { Quote } from "@/src/domain/crm/contracts/quote.entity"

export class GetQuoteUseCase {
  constructor(private repository: QuoteRepository) {}

  async execute(id: string): Promise<Result<Quote | null>> {
    try {
      const quote = await this.repository.getById(id)
      return success(quote)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
