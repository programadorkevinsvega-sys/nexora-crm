import type { PaginatedResult } from "../common/results/paginated-result"
import type { Pagination } from "../common/value-objects/Pagination"
import type { CampaignMember, CampaignMemberCreateInput } from "./campaign-member.entity"

export interface CampaignMemberRepository {
  listByCampaignId(
    campaignId: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<CampaignMember>>
  create(data: CampaignMemberCreateInput): Promise<CampaignMember>
}
