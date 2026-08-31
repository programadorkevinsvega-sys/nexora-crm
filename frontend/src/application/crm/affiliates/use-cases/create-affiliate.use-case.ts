import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { AffiliateRepository } from "@/src/domain/crm/affiliates/affiliate.repository"
import type { Affiliate, AffiliateCreateInput } from "@/src/domain/crm/affiliates/affiliate.entity"

export class CreateAffiliateUseCase {
  constructor(private repository: AffiliateRepository) {}

  async execute(data: AffiliateCreateInput): Promise<Result<Affiliate>> {
    try {
      const affiliate = await this.repository.create(data)
      return success(affiliate)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
