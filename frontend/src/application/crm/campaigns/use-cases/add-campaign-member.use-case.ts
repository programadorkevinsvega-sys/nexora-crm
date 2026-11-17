import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { CampaignMemberRepository } from "@/src/domain/crm/campaigns/campaign-member.repository"
import type { CampaignMember, CampaignMemberCreateInput } from "@/src/domain/crm/campaigns/campaign-member.entity"

export class AddCampaignMemberUseCase {
  constructor(private repository: CampaignMemberRepository) {}

  async execute(data: CampaignMemberCreateInput): Promise<Result<CampaignMember>> {
    try {
      const member = await this.repository.create(data)
      return success(member)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
