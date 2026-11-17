import { Injectable } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'
import type {
  CreateSalesTeam, SalesTeam,
  CreateQuota, SalesQuota,
} from '@crm/contracts'

export interface SalesTeamFilters {
  cursor?: string
  limit?: number
  search?: string
}

export interface PaginatedResult<T> {
  data: T[]
  nextCursor: string | null
}

const CACHE_TTL_MS = 30_000
const CACHE_KEY_PREFIX = 'sales-teams:'

@Injectable()
export class SalesTeamsBffService {
  constructor(
    private readonly api: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  async create(dto: CreateSalesTeam, tenantId: string): Promise<SalesTeam> {
    const team = await this.api.createSalesTeam({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return team
  }

  async list(filters: SalesTeamFilters, tenantId: string): Promise<PaginatedResult<SalesTeam>> {
    const qs = JSON.stringify(filters)
    const cacheKey = `${CACHE_KEY_PREFIX}list:${tenantId}:${qs}`
    return this.cache.getOrSet<PaginatedResult<SalesTeam>>(
      cacheKey,
      () => this.api.listSalesTeams({ tenantId, ...filters }),
      CACHE_TTL_MS,
    )
  }

  async getById(id: string, tenantId: string): Promise<SalesTeam> {
    const cacheKey = `${CACHE_KEY_PREFIX}${id}:${tenantId}`
    return this.cache.getOrSet<SalesTeam>(
      cacheKey,
      () => this.api.getSalesTeam(tenantId, id),
      CACHE_TTL_MS,
    )
  }

  async update(id: string, dto: Partial<CreateSalesTeam>, tenantId: string): Promise<SalesTeam> {
    await this.api.updateSalesTeam({ tenantId, id, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return this.api.getSalesTeam(tenantId, id)
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.api.deleteSalesTeam(tenantId, id)
    this.cache.invalidate(CACHE_KEY_PREFIX)
  }

  async addMember(teamId: string, userId: string, tenantId: string): Promise<void> {
    await this.api.addTeamMember({ tenantId, teamId, userId })
    this.cache.invalidate(CACHE_KEY_PREFIX)
  }

  async removeMember(teamId: string, userId: string, tenantId: string): Promise<void> {
    await this.api.removeTeamMember({ tenantId, teamId, userId })
    this.cache.invalidate(CACHE_KEY_PREFIX)
  }

  async listMembers(teamId: string, tenantId: string): Promise<unknown[]> {
    const cacheKey = `${CACHE_KEY_PREFIX}members:${teamId}:${tenantId}`
    return this.cache.getOrSet<unknown[]>(
      cacheKey,
      () => this.api.listTeamMembers(tenantId, teamId),
      CACHE_TTL_MS,
    )
  }

  async createQuota(teamId: string, dto: CreateQuota, tenantId: string): Promise<SalesQuota> {
    const quota = await this.api.setQuota({ tenantId, teamId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return quota
  }

  async listQuotas(teamId: string, filters: { cursor?: string; limit?: number; periodMonth?: number; periodYear?: number }, tenantId: string): Promise<PaginatedResult<SalesQuota>> {
    const qs = JSON.stringify(filters)
    const cacheKey = `${CACHE_KEY_PREFIX}quotas:${teamId}:${tenantId}:${qs}`
    return this.cache.getOrSet<PaginatedResult<SalesQuota>>(
      cacheKey,
      () => this.api.listQuotas({ tenantId, teamId, ...filters }),
      CACHE_TTL_MS,
    )
  }

  async getQuota(quotaId: string, tenantId: string): Promise<SalesQuota> {
    const cacheKey = `${CACHE_KEY_PREFIX}quota:${quotaId}:${tenantId}`
    return this.cache.getOrSet<SalesQuota>(
      cacheKey,
      () => this.api.getQuota(tenantId, quotaId),
      CACHE_TTL_MS,
    )
  }

  async updateQuotaAchieved(quotaId: string, achievedAmount: number, tenantId: string): Promise<SalesQuota> {
    await this.api.updateAchieved({ tenantId, id: quotaId, achievedAmount })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return this.api.getQuota(tenantId, quotaId)
  }
}
