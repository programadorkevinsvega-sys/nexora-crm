import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { CampaignMemberRepository } from "@/src/domain/crm/campaigns/campaign-member.repository"
import type { CampaignMember } from "@/src/domain/crm/campaigns/campaign-member.entity"

export class ListCampaignMembersUseCase {
  constructor(private repository: CampaignMemberRepository) {}

  async execute(campaignId: string, pagination?: Pagination): Promise<Result<PaginatedResult<CampaignMember>>> {
    try {
      const result = await this.repository.listByCampaignId(campaignId, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
