import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { AffiliatePayoutRepository } from "@/src/domain/crm/affiliates/affiliate-payout.repository"
import type { AffiliatePayout, PayoutCreateInput } from "@/src/domain/crm/affiliates/affiliate-payout.entity"

export class CreatePayoutUseCase {
  constructor(private repository: AffiliatePayoutRepository) {}

  async execute(data: PayoutCreateInput): Promise<Result<AffiliatePayout>> {
    try {
      const payout = await this.repository.create(data)
      return success(payout)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
