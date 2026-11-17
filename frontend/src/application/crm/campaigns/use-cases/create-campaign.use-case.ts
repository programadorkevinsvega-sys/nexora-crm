import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { CampaignRepository } from "@/src/domain/crm/campaigns/campaign.repository"
import type { Campaign, CampaignCreateInput } from "@/src/domain/crm/campaigns/campaign.entity"

export class CreateCampaignUseCase {
  constructor(private repository: CampaignRepository) {}

  async execute(data: CampaignCreateInput): Promise<Result<Campaign>> {
    try {
      const campaign = await this.repository.create(data)
      return success(campaign)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
