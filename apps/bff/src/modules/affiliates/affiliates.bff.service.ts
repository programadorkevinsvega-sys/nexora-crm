import { Injectable } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'
import type {
  CreateProgram, AffiliateProgram,
  RegisterAffiliate, Affiliate,
  RecordCommission, AffiliateCommission,
  ProcessPayout, AffiliatePayout,
} from '@crm/contracts'

export interface PaginatedResult<T> {
  data: T[]
  nextCursor: string | null
}

const CACHE_TTL_MS = 30_000
const CACHE_KEY_PREFIX = 'affiliates:'

@Injectable()
export class AffiliatesBffService {
  constructor(
    private readonly api: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  async createProgram(dto: CreateProgram, tenantId: string): Promise<AffiliateProgram> {
    const program = await this.api.createProgram({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return program
  }

  async listPrograms(filters: {
    isActive?: boolean
    cursor?: string
    limit?: number
  }, tenantId: string): Promise<PaginatedResult<AffiliateProgram>> {
    const qs = JSON.stringify(filters)
    const cacheKey = `${CACHE_KEY_PREFIX}programs:${tenantId}:${qs}`

    return this.cache.getOrSet<PaginatedResult<AffiliateProgram>>(
      cacheKey,
      () => this.api.listPrograms({ tenantId, ...filters }),
      CACHE_TTL_MS,
    )
  }

  async getProgram(id: string, tenantId: string): Promise<AffiliateProgram> {
    const cacheKey = `${CACHE_KEY_PREFIX}program:${id}:${tenantId}`
    return this.cache.getOrSet<AffiliateProgram>(
      cacheKey,
      () => this.api.getProgram(tenantId, id),
      CACHE_TTL_MS,
    )
  }

  async updateProgram(id: string, dto: Partial<CreateProgram>, tenantId: string): Promise<void> {
    await this.api.updateProgram({ tenantId, id, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
  }

  async registerAffiliate(dto: RegisterAffiliate, tenantId: string): Promise<Affiliate> {
    const affiliate = await this.api.registerAffiliate({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return affiliate
  }

  async getAffiliate(id: string, tenantId: string): Promise<Affiliate> {
    const cacheKey = `${CACHE_KEY_PREFIX}affiliate:${id}:${tenantId}`
    return this.cache.getOrSet<Affiliate>(
      cacheKey,
      () => this.api.getAffiliate(tenantId, id),
      CACHE_TTL_MS,
    )
  }

  async listAffiliates(filters: {
    programId?: string
    status?: string
    cursor?: string
    limit?: number
  }, tenantId: string): Promise<PaginatedResult<Affiliate>> {
    const qs = JSON.stringify(filters)
    const cacheKey = `${CACHE_KEY_PREFIX}list:${tenantId}:${qs}`

    return this.cache.getOrSet<PaginatedResult<Affiliate>>(
      cacheKey,
      () => this.api.listAffiliates({ tenantId, ...filters }),
      CACHE_TTL_MS,
    )
  }

  async recordCommission(affiliateId: string, dto: RecordCommission, tenantId: string): Promise<AffiliateCommission> {
    const commission = await this.api.recordCommission({ tenantId, affiliateId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return commission
  }

  async listCommissions(affiliateId: string, filters: {
    status?: string
    cursor?: string
    limit?: number
  }, tenantId: string): Promise<PaginatedResult<AffiliateCommission>> {
    const qs = JSON.stringify(filters)
    const cacheKey = `${CACHE_KEY_PREFIX}commissions:${affiliateId}:${tenantId}:${qs}`

    return this.cache.getOrSet<PaginatedResult<AffiliateCommission>>(
      cacheKey,
      () => this.api.listCommissions({ tenantId, affiliateId, ...filters }),
      CACHE_TTL_MS,
    )
  }

  async processPayout(affiliateId: string, dto: ProcessPayout, tenantId: string): Promise<AffiliatePayout> {
    const payout = await this.api.processPayout({ tenantId, affiliateId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return payout
  }

  async listPayouts(affiliateId: string, filters: {
    status?: string
    cursor?: string
    limit?: number
  }, tenantId: string): Promise<PaginatedResult<AffiliatePayout>> {
    const qs = JSON.stringify(filters)
    const cacheKey = `${CACHE_KEY_PREFIX}payouts:${affiliateId}:${tenantId}:${qs}`

    return this.cache.getOrSet<PaginatedResult<AffiliatePayout>>(
      cacheKey,
      () => this.api.listPayouts({ tenantId, affiliateId, ...filters }),
      CACHE_TTL_MS,
    )
  }
}
