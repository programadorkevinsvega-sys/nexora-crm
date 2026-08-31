import { Injectable } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'
import type {
  CreateConversation, HelpdeskConversation,
  AddThread, HelpdeskThread,
  CreateMailbox, HelpdeskMailbox,
} from '@crm/contracts'

export interface PaginatedResult<T> {
  data: T[]
  nextCursor: string | null
}

const CACHE_TTL_MS = 30_000
const CACHE_KEY_PREFIX = 'helpdesk:'

@Injectable()
export class HelpdeskBffService {
  constructor(
    private readonly api: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  async createConversation(dto: CreateConversation, tenantId: string): Promise<HelpdeskConversation> {
    const conversation = await this.api.createConversation({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return conversation
  }

  async listConversations(filters: {
    mailboxId?: string
    status?: string
    assigneeUserId?: string
    priority?: string
    cursor?: string
    limit?: number
  }, tenantId: string): Promise<PaginatedResult<HelpdeskConversation>> {
    const qs = JSON.stringify(filters)
    const cacheKey = `${CACHE_KEY_PREFIX}conversations:${tenantId}:${qs}`

    return this.cache.getOrSet<PaginatedResult<HelpdeskConversation>>(
      cacheKey,
      () => this.api.listConversations({ tenantId, ...filters }),
      CACHE_TTL_MS,
    )
  }

  async getConversation(id: string, tenantId: string): Promise<HelpdeskConversation> {
    const cacheKey = `${CACHE_KEY_PREFIX}conversation:${id}:${tenantId}`
    return this.cache.getOrSet<HelpdeskConversation>(
      cacheKey,
      () => this.api.getConversation(tenantId, id),
      CACHE_TTL_MS,
    )
  }

  async changeConversationStatus(id: string, status: string, tenantId: string): Promise<void> {
    await this.api.changeConversationStatus({ tenantId, id, status })
    this.cache.invalidate(CACHE_KEY_PREFIX)
  }

  async assignConversation(id: string, assigneeUserId: string, tenantId: string): Promise<void> {
    await this.api.assignConversation({ tenantId, id, agentId: assigneeUserId })
    this.cache.invalidate(CACHE_KEY_PREFIX)
  }

  async resolveConversation(id: string, tenantId: string): Promise<void> {
    await this.api.resolveConversation({ tenantId, id })
    this.cache.invalidate(CACHE_KEY_PREFIX)
  }

  async listThreads(conversationId: string, tenantId: string): Promise<PaginatedResult<HelpdeskThread>> {
    const cacheKey = `${CACHE_KEY_PREFIX}threads:${conversationId}:${tenantId}`
    return this.cache.getOrSet<PaginatedResult<HelpdeskThread>>(
      cacheKey,
      () => this.api.listThreads(tenantId, conversationId),
      CACHE_TTL_MS,
    )
  }

  async addThread(conversationId: string, dto: AddThread, tenantId: string): Promise<HelpdeskThread> {
    const thread = await this.api.addThread({ tenantId, conversationId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return thread
  }

  async listMailboxes(tenantId: string): Promise<HelpdeskMailbox[]> {
    const cacheKey = `${CACHE_KEY_PREFIX}mailboxes:${tenantId}`
    return this.cache.getOrSet<HelpdeskMailbox[]>(
      cacheKey,
      () => this.api.listMailboxes(tenantId),
      CACHE_TTL_MS,
    )
  }

  async createMailbox(dto: CreateMailbox, tenantId: string): Promise<HelpdeskMailbox> {
    const mailbox = await this.api.createMailbox({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return mailbox
  }

  async getAgentProfile(userId: string, tenantId: string): Promise<Record<string, unknown>> {
    const cacheKey = `${CACHE_KEY_PREFIX}agentProfile:${userId}:${tenantId}`
    return this.cache.getOrSet<Record<string, unknown>>(
      cacheKey,
      () => this.api.getAgentProfile(tenantId),
      CACHE_TTL_MS,
    )
  }

  async updateAgentAvailability(dto: { isAvailable: boolean; agentStatus?: string }, userId: string, tenantId: string): Promise<void> {
    await this.api.updateAgentAvailability({ tenantId, userId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
  }
}
