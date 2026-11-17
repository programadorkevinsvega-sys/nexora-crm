import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { CampaignRepository } from "@/src/domain/crm/campaigns/campaign.repository"
import type { Campaign } from "@/src/domain/crm/campaigns/campaign.entity"

export class GetCampaignUseCase {
  constructor(private repository: CampaignRepository) {}

  async execute(id: string): Promise<Result<Campaign | null>> {
    try {
      const campaign = await this.repository.getById(id)
      return success(campaign)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
