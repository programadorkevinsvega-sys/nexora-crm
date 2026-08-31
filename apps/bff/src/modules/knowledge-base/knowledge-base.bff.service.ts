import { Injectable } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'
import type {
  KnowledgeBaseCategory,
  CreateKnowledgeBaseCategory,
  KnowledgeBaseArticle,
  CreateKnowledgeBaseArticle,
  CustomerPortalOverview,
} from '@crm/contracts'

const CACHE_TTL_MS = 20_000
const CACHE_KEY_PREFIX = 'kb:'

@Injectable()
export class KnowledgeBaseBffService {
  constructor(
    private readonly api: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  async listCategories(tenantId: string = '00000000-0000-0000-0000-000000000001'): Promise<KnowledgeBaseCategory[]> {
    const cacheKey = `${CACHE_KEY_PREFIX}categories:${tenantId}`
    return this.cache.getOrSet<KnowledgeBaseCategory[]>(
      cacheKey,
      () => this.api.listKbCategories(tenantId),
      CACHE_TTL_MS,
    )
  }

  async createCategory(
    dto: CreateKnowledgeBaseCategory,
    tenantId: string = '00000000-0000-0000-0000-000000000001',
  ): Promise<KnowledgeBaseCategory> {
    const res = await this.api.createKbCategory({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return res
  }

  async listArticles(
    filters?: { categoryId?: string; query?: string; publicOnly?: boolean },
    tenantId: string = '00000000-0000-0000-0000-000000000001',
  ): Promise<KnowledgeBaseArticle[]> {
    return this.api.listKbArticles(tenantId, filters)
  }

  async getArticle(
    idOrSlug: string,
    tenantId: string = '00000000-0000-0000-0000-000000000001',
  ): Promise<KnowledgeBaseArticle> {
    return this.api.getKbArticle(tenantId, idOrSlug)
  }

  async createArticle(
    dto: CreateKnowledgeBaseArticle,
    tenantId: string = '00000000-0000-0000-0000-000000000001',
  ): Promise<KnowledgeBaseArticle> {
    const res = await this.api.createKbArticle({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return res
  }

  async voteArticle(
    articleId: string,
    isHelpful: boolean,
    tenantId: string = '00000000-0000-0000-0000-000000000001',
  ): Promise<KnowledgeBaseArticle> {
    return this.api.voteKbArticle({ tenantId, articleId, isHelpful })
  }

  async getPortalOverview(
    contactId: string,
    tenantId: string = '00000000-0000-0000-0000-000000000001',
  ): Promise<CustomerPortalOverview> {
    return this.api.getCustomerPortalOverview(tenantId, contactId)
  }
}
