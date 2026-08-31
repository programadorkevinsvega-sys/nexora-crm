import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { AffiliateCommissionRepository } from "@/src/domain/crm/affiliates/affiliate-commission.repository"
import type { AffiliateCommission, CommissionCreateInput } from "@/src/domain/crm/affiliates/affiliate-commission.entity"

export class CreateCommissionUseCase {
  constructor(private repository: AffiliateCommissionRepository) {}

  async execute(data: CommissionCreateInput): Promise<Result<AffiliateCommission>> {
    try {
      const commission = await this.repository.create(data)
      return success(commission)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
