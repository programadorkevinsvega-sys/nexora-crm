import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { CampaignRepository, CampaignFilters } from "@/src/domain/crm/campaigns/campaign.repository"
import type { Campaign } from "@/src/domain/crm/campaigns/campaign.entity"

export class ListCampaignsUseCase {
  constructor(private repository: CampaignRepository) {}

  async execute(filters?: CampaignFilters, pagination?: Pagination): Promise<Result<PaginatedResult<Campaign>>> {
    try {
      const result = await this.repository.list(filters, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
