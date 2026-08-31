import { Injectable } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'
import type { RevenueMetrics, FunnelMetrics, CohortMetrics } from '@crm/contracts'

const CACHE_TTL_MS = 30_000
const CACHE_KEY_PREFIX = 'analytics:'

@Injectable()
export class AnalyticsBffService {
  constructor(
    private readonly api: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  async getRevenueMetrics(
    tenantId: string = '00000000-0000-0000-0000-000000000001',
  ): Promise<RevenueMetrics> {
    const cacheKey = `${CACHE_KEY_PREFIX}revenue:${tenantId}`
    return this.cache.getOrSet<RevenueMetrics>(
      cacheKey,
      () => this.api.getRevenueMetrics(tenantId),
      CACHE_TTL_MS,
    )
  }

  async getFunnelMetrics(
    tenantId: string = '00000000-0000-0000-0000-000000000001',
  ): Promise<FunnelMetrics> {
    const cacheKey = `${CACHE_KEY_PREFIX}funnel:${tenantId}`
    return this.cache.getOrSet<FunnelMetrics>(
      cacheKey,
      () => this.api.getFunnelMetrics(tenantId),
      CACHE_TTL_MS,
    )
  }

  async getCohortMetrics(
    tenantId: string = '00000000-0000-0000-0000-000000000001',
  ): Promise<CohortMetrics> {
    const cacheKey = `${CACHE_KEY_PREFIX}cohorts:${tenantId}`
    return this.cache.getOrSet<CohortMetrics>(
      cacheKey,
      () => this.api.getCohortMetrics(tenantId),
      CACHE_TTL_MS,
    )
  }
}
