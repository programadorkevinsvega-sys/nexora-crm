import { Injectable } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'
import type {
  CreateCampaign, Campaign,
  AddCampaignMember, CampaignMember,
} from '@crm/contracts'

export interface CampaignFilters {
  cursor?: string
  limit?: number
  status?: string
  type?: string
}

export interface CampaignStats {
  total: number
  sent: number
  opened: number
  clicked: number
  responded: number
  bounced: number
  unsubscribed: number
}

export interface PaginatedResult<T> {
  data: T[]
  nextCursor: string | null
}

const CACHE_TTL_MS = 30_000
const CACHE_KEY_PREFIX = 'campaigns:'

@Injectable()
export class CampaignsBffService {
  constructor(
    private readonly api: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  async create(dto: CreateCampaign, tenantId: string): Promise<Campaign> {
    const campaign = await this.api.createCampaign({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return campaign
  }

  async list(filters: CampaignFilters, tenantId: string): Promise<PaginatedResult<Campaign>> {
    const qs = JSON.stringify(filters)
    const cacheKey = `${CACHE_KEY_PREFIX}list:${tenantId}:${qs}`
    return this.cache.getOrSet<PaginatedResult<Campaign>>(
      cacheKey,
      () => this.api.listCampaigns({ tenantId, ...filters }),
      CACHE_TTL_MS,
    )
  }

  async getById(id: string, tenantId: string): Promise<Campaign> {
    const cacheKey = `${CACHE_KEY_PREFIX}${id}:${tenantId}`
    return this.cache.getOrSet<Campaign>(
      cacheKey,
      () => this.api.getCampaign(tenantId, id),
      CACHE_TTL_MS,
    )
  }

  async update(id: string, dto: Partial<CreateCampaign>, tenantId: string): Promise<Campaign> {
    await this.api.updateCampaign({ tenantId, id, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return this.api.getCampaign(tenantId, id)
  }

  async updateStatus(id: string, status: string, tenantId: string): Promise<Campaign> {
    await this.api.updateCampaignStatus({ tenantId, id, status })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return this.api.getCampaign(tenantId, id)
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.api.deleteCampaign(tenantId, id)
    this.cache.invalidate(CACHE_KEY_PREFIX)
  }

  async addMember(campaignId: string, dto: AddCampaignMember, tenantId: string): Promise<CampaignMember> {
    const member = await this.api.addCampaignMember({ tenantId, campaignId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return member
  }

  async listMembers(campaignId: string, filters: { cursor?: string; limit?: number }, tenantId: string): Promise<PaginatedResult<CampaignMember>> {
    const qs = JSON.stringify(filters)
    const cacheKey = `${CACHE_KEY_PREFIX}members:${campaignId}:${tenantId}:${qs}`
    return this.cache.getOrSet<PaginatedResult<CampaignMember>>(
      cacheKey,
      () => this.api.listCampaignMembers({ tenantId, campaignId, ...filters }),
      CACHE_TTL_MS,
    )
  }

  async updateMemberStatus(memberId: string, status: string, tenantId: string): Promise<{ id: string }> {
    await this.api.updateCampaignMemberStatus({ tenantId, id: memberId, status })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return { id: memberId }
  }

  async getCampaignStats(campaignId: string, tenantId: string): Promise<CampaignStats> {
    const cacheKey = `${CACHE_KEY_PREFIX}stats:${campaignId}:${tenantId}`
    return this.cache.getOrSet<CampaignStats>(
      cacheKey,
      async () => {
        // Fetch all members for this campaign to calculate stats.
        // In a real application, this might be handled by an aggregation query in the core service.
        const result = await this.api.listCampaignMembers({ tenantId, campaignId, limit: 10000 })
        const members = result.data || []
        
        const total = members.length
        let sent = 0, opened = 0, clicked = 0, responded = 0, bounced = 0, unsubscribed = 0
        
        members.forEach((m) => {
          if (m.status === 'SENT') sent++
          if (m.status === 'OPENED') opened++
          if (m.status === 'CLICKED') clicked++
          if (m.status === 'RESPONDED') responded++
          if (m.status === 'BOUNCED') bounced++
          if (m.status === 'UNSUBSCRIBED') unsubscribed++
        })
        
        return { total, sent, opened, clicked, responded, bounced, unsubscribed }
      },
      CACHE_TTL_MS,
    )
  }
}
