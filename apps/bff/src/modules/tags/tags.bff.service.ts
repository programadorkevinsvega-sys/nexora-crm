import { Injectable } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'
import type { CreateTag, Tag } from '@crm/contracts'

export interface TagFilters {
  tenantId: string
  search?: string
}

const CACHE_TTL_MS = 30_000
const CACHE_KEY_PREFIX = 'tags:'

@Injectable()
export class TagsBffService {
  constructor(
    private readonly api: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  async create(dto: CreateTag, tenantId: string): Promise<Tag> {
    const tag = await this.api.createTag({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return tag
  }

  async list(filters: TagFilters): Promise<{ data: Tag[] }> {
    const qs = JSON.stringify(filters)
    const cacheKey = `${CACHE_KEY_PREFIX}list:${filters.tenantId}:${qs}`
    return this.cache.getOrSet<{ data: Tag[] }>(
      cacheKey,
      async () => {
        const result = await this.api.listTags(filters)
        return { data: result.data }
      },
      CACHE_TTL_MS,
    )
  }

  async getById(id: string, tenantId: string): Promise<Tag> {
    const cacheKey = `${CACHE_KEY_PREFIX}${id}:${tenantId}`
    return this.cache.getOrSet<Tag>(
      cacheKey,
      () => this.api.getTag(tenantId, id),
      CACHE_TTL_MS,
    )
  }

  async update(id: string, dto: { name?: string; color?: string }, tenantId: string): Promise<Tag> {
    await this.api.updateTag({ tenantId, id, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return this.api.getTag(tenantId, id)
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.api.deleteTag(tenantId, id)
    this.cache.invalidate(CACHE_KEY_PREFIX)
  }
}
