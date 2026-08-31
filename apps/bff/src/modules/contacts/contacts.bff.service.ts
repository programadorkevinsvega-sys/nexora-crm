import { Injectable } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'
import type { CreateContact, UpdateContact, Contact } from '@crm/contracts'

export interface ContactFilters {
  cursor?: string
  limit?: number
  search?: string
  leadStatus?: string
  companyId?: string
  isStarred?: boolean
  assignedUserId?: string
  visibleUserIds?: string[]
}

export interface PaginatedResult<T> {
  data: T[]
  nextCursor: string | null
}

const CACHE_TTL_MS = 30_000
const CACHE_KEY_PREFIX = 'contacts:'

@Injectable()
export class ContactsBffService {
  constructor(
    private readonly api: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  async create(dto: CreateContact, tenantId: string): Promise<Contact> {
    const contact = await this.api.createContact({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return contact
  }

  async list(filters: ContactFilters, tenantId: string): Promise<PaginatedResult<Contact>> {
    const qs = JSON.stringify(filters)
    const cacheKey = `${CACHE_KEY_PREFIX}list:${tenantId}:${qs}`

    return this.cache.getOrSet<PaginatedResult<Contact>>(
      cacheKey,
      () => this.api.listContacts({ tenantId, ...filters }),
      CACHE_TTL_MS,
    )
  }

  async getById(id: string, tenantId: string): Promise<Contact> {
    const cacheKey = `${CACHE_KEY_PREFIX}${id}:${tenantId}`

    return this.cache.getOrSet<Contact>(
      cacheKey,
      () => this.api.getContact(tenantId, id),
      CACHE_TTL_MS,
    )
  }

  async update(id: string, dto: UpdateContact, tenantId: string): Promise<Contact> {
    await this.api.updateContact({ tenantId, id, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return this.api.getContact(tenantId, id)
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.api.deleteContact(tenantId, id)
    this.cache.invalidate(CACHE_KEY_PREFIX)
  }
}
