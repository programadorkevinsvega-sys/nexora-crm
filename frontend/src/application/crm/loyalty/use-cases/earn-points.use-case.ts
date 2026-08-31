import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { LoyaltyProfileRepository } from "@/src/domain/crm/loyalty/loyalty-profile.repository"
import type { LoyaltyProfile } from "@/src/domain/crm/loyalty/loyalty-profile.entity"

export class EarnPointsUseCase {
  constructor(private repository: LoyaltyProfileRepository) {}

  async execute(contactId: string, points: number): Promise<Result<LoyaltyProfile>> {
    try {
      const profile = await this.repository.earnPoints(contactId, points)
      return success(profile)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
