import { Injectable } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'
import type { CreateSegment, CustomerSegment } from '@crm/contracts'

export interface PaginatedResult<T> {
  data: T[]
  nextCursor: string | null
}

const CACHE_TTL_MS = 30_000
const CACHE_KEY_PREFIX = 'loyalty:'

@Injectable()
export class LoyaltyBffService {
  constructor(
    private readonly api: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  async getProfile(contactId: string, tenantId: string): Promise<Record<string, unknown>> {
    const cacheKey = `${CACHE_KEY_PREFIX}profile:${contactId}:${tenantId}`
    return this.cache.getOrSet<Record<string, unknown>>(
      cacheKey,
      () => this.api.getLoyaltyProfile(tenantId, contactId),
      CACHE_TTL_MS,
    )
  }

  async earnPoints(dto: { contactId: string; points: number }, tenantId: string): Promise<Record<string, unknown>> {
    const result = await this.api.earnPoints({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return result
  }

  async redeemPoints(dto: { contactId: string; points: number }, tenantId: string): Promise<Record<string, unknown>> {
    const result = await this.api.redeemPoints({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return result
  }

  async listSegments(tenantId: string): Promise<CustomerSegment[]> {
    const cacheKey = `${CACHE_KEY_PREFIX}segments:${tenantId}`
    return this.cache.getOrSet<CustomerSegment[]>(
      cacheKey,
      () => this.api.listLoyaltySegments(tenantId),
      CACHE_TTL_MS,
    )
  }

  async createSegment(dto: CreateSegment, tenantId: string): Promise<CustomerSegment> {
    const segment = await this.api.createSegment({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return segment
  }

  async assignToSegment(segmentId: string, contactId: string, tenantId: string): Promise<void> {
    await this.api.assignToSegment({ tenantId, segmentId, contactId })
    this.cache.invalidate(CACHE_KEY_PREFIX)
  }

  async getMetrics(contactId: string, tenantId: string): Promise<Record<string, unknown>> {
    const cacheKey = `${CACHE_KEY_PREFIX}metrics:${contactId}:${tenantId}`
    return this.cache.getOrSet<Record<string, unknown>>(
      cacheKey,
      () => this.api.getLoyaltyMetrics(tenantId, contactId),
      CACHE_TTL_MS,
    )
  }
}
