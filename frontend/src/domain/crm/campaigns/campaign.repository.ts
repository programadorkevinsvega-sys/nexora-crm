import type { Repository } from "../common/repositories/repository.interface"
import type { Campaign, CampaignCreateInput, CampaignUpdateInput } from "./campaign.entity"

export interface CampaignFilters {
  status?: string
  tenantId?: string
  search?: string
  cursor?: string
  limit?: number
}

export type CampaignRepository = Repository<Campaign, CampaignCreateInput, CampaignUpdateInput, CampaignFilters>
