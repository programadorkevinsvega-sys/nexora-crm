import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { QuoteRepository } from "@/src/domain/crm/contracts/quote.repository"
import type { Quote, QuoteCreateInput } from "@/src/domain/crm/contracts/quote.entity"

export class CreateQuoteUseCase {
  constructor(private repository: QuoteRepository) {}

  async execute(data: QuoteCreateInput): Promise<Result<Quote>> {
    try {
      const quote = await this.repository.create(data)
      return success(quote)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
