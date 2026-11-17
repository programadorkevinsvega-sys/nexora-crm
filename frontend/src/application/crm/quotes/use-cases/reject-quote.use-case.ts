import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { QuoteRepository } from "@/src/domain/crm/contracts/quote.repository"
import type { Quote } from "@/src/domain/crm/contracts/quote.entity"

export interface QuoteRepositoryExtended extends QuoteRepository {
  reject(id: string): Promise<Quote>
}

export class RejectQuoteUseCase {
  constructor(private repository: QuoteRepositoryExtended) {}

  async execute(id: string): Promise<Result<Quote>> {
    try {
      const quote = await this.repository.reject(id)
      return success(quote)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
