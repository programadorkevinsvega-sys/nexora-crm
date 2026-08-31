import { Injectable } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'
import type {
  InboxConversation,
  InboxMessage,
  SendInboxMessage,
} from '@crm/contracts'

const CACHE_TTL_MS = 10_000
const CACHE_KEY_PREFIX = 'inbox:'

@Injectable()
export class InboxBffService {
  constructor(
    private readonly api: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  async listConversations(
    channel?: string,
    status?: string,
    tenantId: string = '00000000-0000-0000-0000-000000000001',
  ): Promise<InboxConversation[]> {
    const cacheKey = `${CACHE_KEY_PREFIX}convs:${tenantId}:${channel ?? 'all'}:${status ?? 'all'}`
    return this.cache.getOrSet<InboxConversation[]>(
      cacheKey,
      () => this.api.listInboxConversations(tenantId, channel, status),
      CACHE_TTL_MS,
    )
  }

  async getConversation(
    id: string,
    tenantId: string = '00000000-0000-0000-0000-000000000001',
  ): Promise<InboxConversation> {
    return this.api.getInboxConversation(tenantId, id)
  }

  async sendMessage(
    dto: SendInboxMessage,
    tenantId: string = '00000000-0000-0000-0000-000000000001',
  ): Promise<InboxMessage> {
    const res = await this.api.sendInboxMessage({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return res
  }
}
