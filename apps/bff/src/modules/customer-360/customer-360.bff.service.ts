import { Injectable } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'
import type { Customer360Profile } from '@crm/contracts'

const CACHE_TTL_MS = 15_000
const CACHE_KEY_PREFIX = 'customer-360:'

@Injectable()
export class Customer360BffService {
  constructor(
    private readonly api: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  async getCustomer360(contactId: string, tenantId: string): Promise<Customer360Profile> {
    const cacheKey = `${CACHE_KEY_PREFIX}${tenantId}:${contactId}`
    return this.cache.getOrSet<Customer360Profile>(
      cacheKey,
      () => this.api.getCustomer360(tenantId, contactId),
      CACHE_TTL_MS,
    )
  }
}
