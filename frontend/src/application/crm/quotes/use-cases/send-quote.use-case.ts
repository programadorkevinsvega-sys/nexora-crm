import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { QuoteRepository } from "@/src/domain/crm/contracts/quote.repository"
import type { Quote } from "@/src/domain/crm/contracts/quote.entity"

export interface QuoteRepositoryExtended extends QuoteRepository {
  send(id: string): Promise<Quote>
}

export class SendQuoteUseCase {
  constructor(private repository: QuoteRepositoryExtended) {}

  async execute(id: string): Promise<Result<Quote>> {
    try {
      const quote = await this.repository.send(id)
      return success(quote)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
