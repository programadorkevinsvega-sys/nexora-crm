import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { AffiliateRepository } from "@/src/domain/crm/affiliates/affiliate.repository"
import type { Affiliate } from "@/src/domain/crm/affiliates/affiliate.entity"

export class GetAffiliateUseCase {
  constructor(private repository: AffiliateRepository) {}

  async execute(id: string): Promise<Result<Affiliate | null>> {
    try {
      const affiliate = await this.repository.getById(id)
      return success(affiliate)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
