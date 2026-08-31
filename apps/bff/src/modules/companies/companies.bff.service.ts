import { Injectable } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'
import type { CreateCompany, UpdateCompany, Company } from '@crm/contracts'

export interface CompanyFilters {
  cursor?: string
  limit?: number
  search?: string
  industry?: string
}

export interface PaginatedResult<T> {
  data: T[]
  nextCursor: string | null
}

const CACHE_TTL_MS = 30_000
const CACHE_KEY_PREFIX = 'companies:'

@Injectable()
export class CompaniesBffService {
  constructor(
    private readonly api: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  async create(dto: CreateCompany, tenantId: string): Promise<Company> {
    const company = await this.api.createCompany({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return company
  }

  async list(filters: CompanyFilters, tenantId: string): Promise<PaginatedResult<Company>> {
    const qs = JSON.stringify(filters)
    const cacheKey = `${CACHE_KEY_PREFIX}list:${tenantId}:${qs}`

    return this.cache.getOrSet<PaginatedResult<Company>>(
      cacheKey,
      () => this.api.listCompanies({ tenantId, ...filters }),
      CACHE_TTL_MS,
    )
  }

  async getById(id: string, tenantId: string): Promise<Company> {
    const cacheKey = `${CACHE_KEY_PREFIX}${id}:${tenantId}`

    return this.cache.getOrSet<Company>(
      cacheKey,
      () => this.api.getCompany(tenantId, id),
      CACHE_TTL_MS,
    )
  }

  async update(id: string, dto: UpdateCompany, tenantId: string): Promise<Company> {
    await this.api.updateCompany({ tenantId, id, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return this.api.getCompany(tenantId, id)
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.api.deleteCompany(tenantId, id)
    this.cache.invalidate(CACHE_KEY_PREFIX)
  }
}
