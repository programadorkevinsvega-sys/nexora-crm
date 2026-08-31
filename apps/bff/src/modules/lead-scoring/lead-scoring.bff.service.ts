import { Injectable } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'
import type {
  LeadScoringRule,
  CreateScoringRule,
  LeadScore,
  AdjustScore,
} from '@crm/contracts'

const CACHE_TTL_MS = 30_000
const CACHE_KEY_PREFIX = 'scoring:'

@Injectable()
export class LeadScoringBffService {
  constructor(
    private readonly api: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  async createRule(dto: CreateScoringRule, tenantId: string): Promise<{ id: string }> {
    const res = await this.api.createScoringRule({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return res
  }

  async toggleRule(id: string, tenantId: string): Promise<LeadScoringRule> {
    const res = await this.api.toggleScoringRule(tenantId, id)
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return res
  }

  async listRules(tenantId: string): Promise<LeadScoringRule[]> {
    const cacheKey = `${CACHE_KEY_PREFIX}rules:${tenantId}`
    return this.cache.getOrSet<LeadScoringRule[]>(
      cacheKey,
      () => this.api.listScoringRules(tenantId),
      CACHE_TTL_MS,
    )
  }

  async getLeadScore(contactId: string, tenantId: string): Promise<LeadScore | null> {
    return this.api.getLeadScore(tenantId, contactId)
  }

  async recalculateScore(
    contactId: string,
    context: Record<string, unknown>,
    tenantId: string,
  ): Promise<LeadScore> {
    return this.api.recalculateLeadScore({ tenantId, contactId, contactContext: context })
  }

  async adjustScore(dto: AdjustScore, tenantId: string): Promise<LeadScore> {
    return this.api.adjustLeadScore({ tenantId, ...dto })
  }

  async listTopLeads(limit: number, tenantId: string): Promise<LeadScore[]> {
    return this.api.listTopLeads(tenantId, limit)
  }
}
