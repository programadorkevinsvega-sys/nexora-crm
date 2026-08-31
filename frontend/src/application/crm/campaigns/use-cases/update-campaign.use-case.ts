import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { CampaignRepository } from "@/src/domain/crm/campaigns/campaign.repository"
import type { Campaign, CampaignUpdateInput } from "@/src/domain/crm/campaigns/campaign.entity"

export class UpdateCampaignUseCase {
  constructor(private repository: CampaignRepository) {}

  async execute(id: string, data: CampaignUpdateInput): Promise<Result<Campaign>> {
    try {
      const campaign = await this.repository.update(id, data)
      return success(campaign)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
