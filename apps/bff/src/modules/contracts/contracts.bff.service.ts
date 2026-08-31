import { Injectable } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'
import type { CreateQuote, Quote, CreateContract, Contract } from '@crm/contracts'

export interface QuoteFilters {
  cursor?: string
  limit?: number
  dealId?: string
  status?: string
}

export interface ContractFilters {
  cursor?: string
  limit?: number
  companyId?: string
  status?: string
}

export interface PaginatedResult<T> {
  data: T[]
  nextCursor: string | null
}

const CACHE_TTL_MS = 30_000
const CACHE_KEY_PREFIX = 'contracts:'

@Injectable()
export class ContractsBffService {
  constructor(
    private readonly api: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  async createQuote(dto: CreateQuote, tenantId: string): Promise<Quote> {
    const quote = await this.api.createQuote({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return quote
  }

  async listQuotes(filters: QuoteFilters, tenantId: string): Promise<PaginatedResult<Quote>> {
    const qs = JSON.stringify(filters)
    const cacheKey = `${CACHE_KEY_PREFIX}quotes:${tenantId}:${qs}`
    return this.cache.getOrSet<PaginatedResult<Quote>>(
      cacheKey,
      () => this.api.listQuotes({ tenantId, ...filters }),
      CACHE_TTL_MS,
    )
  }

  async getQuote(id: string, tenantId: string): Promise<Quote> {
    const cacheKey = `${CACHE_KEY_PREFIX}quote:${id}:${tenantId}`
    return this.cache.getOrSet<Quote>(
      cacheKey,
      () => this.api.getQuote(tenantId, id),
      CACHE_TTL_MS,
    )
  }

  async sendQuote(id: string, tenantId: string): Promise<Quote> {
    await this.api.sendQuote({ tenantId, id })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return this.api.getQuote(tenantId, id)
  }

  async acceptQuote(id: string, tenantId: string): Promise<Quote> {
    await this.api.acceptQuote({ tenantId, id })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return this.api.getQuote(tenantId, id)
  }

  async rejectQuote(id: string, reason: string, tenantId: string): Promise<Quote> {
    await this.api.rejectQuote({ tenantId, id, reason })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return this.api.getQuote(tenantId, id)
  }

  async createContract(dto: CreateContract, tenantId: string): Promise<Contract> {
    const contract = await this.api.createContract({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return contract
  }

  async listContracts(filters: ContractFilters, tenantId: string): Promise<PaginatedResult<Contract>> {
    const qs = JSON.stringify(filters)
    const cacheKey = `${CACHE_KEY_PREFIX}list:${tenantId}:${qs}`
    return this.cache.getOrSet<PaginatedResult<Contract>>(
      cacheKey,
      () => this.api.listContracts({ tenantId, ...filters }),
      CACHE_TTL_MS,
    )
  }

  async getContract(id: string, tenantId: string): Promise<Contract> {
    const cacheKey = `${CACHE_KEY_PREFIX}${id}:${tenantId}`
    return this.cache.getOrSet<Contract>(
      cacheKey,
      () => this.api.getContract(tenantId, id),
      CACHE_TTL_MS,
    )
  }

  async updateContract(id: string, dto: Partial<CreateContract>, tenantId: string): Promise<Contract> {
    await this.api.updateContract({ tenantId, id, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return this.api.getContract(tenantId, id)
  }

  async renewContract(id: string, tenantId: string): Promise<Contract> {
    await this.api.renewContract({ tenantId, id })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return this.api.getContract(tenantId, id)
  }

  async updateContractStatus(id: string, status: string, tenantId: string): Promise<Contract> {
    await this.api.updateContractStatus({ tenantId, id, status })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return this.api.getContract(tenantId, id)
  }
}
