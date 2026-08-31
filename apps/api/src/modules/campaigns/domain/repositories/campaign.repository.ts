import { Campaign } from '../entities/campaign.entity'
import { CampaignMember, CampaignMemberStatus } from '../entities/campaign-member.entity'

export interface CampaignFilter {
  search?: string
  status?: string
  type?: string
  cursor?: string
  limit: number
}

export interface PaginatedCampaigns {
  data: Campaign[]
  nextCursor: string | null
}

export interface PaginatedCampaignMembers {
  data: CampaignMember[]
  nextCursor: string | null
}

export abstract class CampaignRepository {
  abstract findById(tenantId: string, id: string): Promise<Campaign | null>
  abstract findMemberById(tenantId: string, id: string): Promise<CampaignMember | null>
  abstract list(tenantId: string, filter: CampaignFilter): Promise<PaginatedCampaigns>
  abstract listMembers(tenantId: string, campaignId: string, cursor?: string, limit?: number): Promise<PaginatedCampaignMembers>
  abstract save(campaign: Campaign): Promise<void>
  abstract saveMember(member: CampaignMember): Promise<void>
  abstract updateMemberStatus(tenantId: string, id: string, status: CampaignMemberStatus, respondedAt: Date | null): Promise<void>
  abstract delete(tenantId: string, id: string): Promise<void>
  abstract deleteMember(tenantId: string, id: string): Promise<void>
}
