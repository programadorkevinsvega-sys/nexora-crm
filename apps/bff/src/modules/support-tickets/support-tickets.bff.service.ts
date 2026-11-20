import { Injectable } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'
import type {
  CreateTicket, SupportTicket,
  CreateReply, TicketReply,
} from '@crm/contracts'

export interface TicketFilters {
  cursor?: string
  limit?: number
  status?: string
  priority?: string
  assignedUserId?: string
  contactId?: string
}

export interface PaginatedResult<T> {
  data: T[]
  nextCursor: string | null
}

const CACHE_TTL_MS = 30_000
const CACHE_KEY_PREFIX = 'tickets:'

@Injectable()
export class SupportTicketsBffService {
  constructor(
    private readonly api: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  async create(dto: CreateTicket, tenantId: string): Promise<SupportTicket> {
    const ticket = await this.api.createTicket({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return ticket
  }

  async list(filters: TicketFilters, tenantId: string): Promise<PaginatedResult<SupportTicket>> {
    const qs = JSON.stringify(filters)
    const cacheKey = `${CACHE_KEY_PREFIX}list:${tenantId}:${qs}`
    return this.cache.getOrSet<PaginatedResult<SupportTicket>>(
      cacheKey,
      () => this.api.listTickets({ tenantId, ...filters }),
      CACHE_TTL_MS,
    )
  }

  async getById(id: string, tenantId: string): Promise<SupportTicket> {
    const cacheKey = `${CACHE_KEY_PREFIX}${id}:${tenantId}`
    return this.cache.getOrSet<SupportTicket>(
      cacheKey,
      () => this.api.getTicket(tenantId, id),
      CACHE_TTL_MS,
    )
  }

  async updateStatus(id: string, status: string, tenantId: string): Promise<SupportTicket> {
    await this.api.updateTicketStatus({ tenantId, id, status })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return this.api.getTicket(tenantId, id)
  }

  async assign(id: string, assignedUserId: string, tenantId: string): Promise<SupportTicket> {
    await this.api.assignTicket({ tenantId, id, assignedUserId })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return this.api.getTicket(tenantId, id)
  }

  async addReply(ticketId: string, dto: CreateReply & { authorType: TicketReply['authorType']; authorId: string; isInternalNote?: boolean }, tenantId: string): Promise<TicketReply> {
    const reply = await this.api.addTicketReply({ tenantId, ticketId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return reply
  }

  async listReplies(ticketId: string, tenantId: string): Promise<TicketReply[]> {
    const cacheKey = `${CACHE_KEY_PREFIX}replies:${ticketId}:${tenantId}`
    return this.cache.getOrSet<TicketReply[]>(
      cacheKey,
      () => this.api.getTicketReplies(tenantId, ticketId).then(r => r.data),
      CACHE_TTL_MS,
    )
  }
}
