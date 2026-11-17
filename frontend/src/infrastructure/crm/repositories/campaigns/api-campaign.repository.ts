import { api, qs } from "../../api/api-client"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { CampaignFilters } from "@/src/domain/crm/campaigns/campaign.repository"
import type { Campaign, CampaignCreateInput, CampaignUpdateInput } from "@/src/domain/crm/campaigns/campaign.entity"
import type { CampaignMember, CampaignMemberCreateInput } from "@/src/domain/crm/campaigns/campaign-member.entity"

export const ApiCampaignRepository = {
  async list(filters: CampaignFilters = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Campaign>> {
    const params = { ...filters, cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    return api.get<PaginatedResult<Campaign>>(`/api/campaigns${qs(params)}`)
  },
  async getById(id: string): Promise<Campaign> {
    return api.get<Campaign>(`/api/campaigns/${id}`)
  },
  async create(data: CampaignCreateInput): Promise<Campaign> {
    return api.post<Campaign>("/api/campaigns", data)
  },
  async update(id: string, data: CampaignUpdateInput): Promise<Campaign> {
    return api.put<Campaign>(`/api/campaigns/${id}`, data)
  },
  async delete(id: string): Promise<void> {
    return api.delete(`/api/campaigns/${id}`)
  },
  async listMembers(campaignId: string, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<CampaignMember>> {
    const params = { cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    return api.get<PaginatedResult<CampaignMember>>(`/api/campaigns/${campaignId}/members${qs(params)}`)
  },
  async addMember(data: CampaignMemberCreateInput): Promise<CampaignMember> {
    return api.post<CampaignMember>(`/api/campaigns/${data.campaignId}/members`, data)
  },
}
