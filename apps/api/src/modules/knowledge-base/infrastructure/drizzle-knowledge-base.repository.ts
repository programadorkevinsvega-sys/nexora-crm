import { Injectable } from '@nestjs/common'
import { KnowledgeBaseRepository } from '../domain/repositories/knowledge-base.repository'
import { KbCategory } from '../domain/entities/kb-category.entity'
import { KbArticle } from '../domain/entities/kb-article.entity'
import { CustomerPortalOverview } from '../domain/entities/portal-overview.entity'
import { KbArticlesDrizzleHelper } from './kb-articles.drizzle'
import { KbPortalDrizzleHelper } from './kb-portal.drizzle'

@Injectable()
export class DrizzleKnowledgeBaseRepository extends KnowledgeBaseRepository {
  listCategories(tenantId: string): Promise<KbCategory[]> {
    return KbArticlesDrizzleHelper.listCategories(tenantId)
  }

  createCategory(tenantId: string, category: KbCategory): Promise<KbCategory> {
    return KbArticlesDrizzleHelper.createCategory(tenantId, category)
  }

  listArticles(
    tenantId: string,
    filters?: { categoryId?: string; query?: string; publicOnly?: boolean },
  ): Promise<KbArticle[]> {
    return KbArticlesDrizzleHelper.listArticles(tenantId, filters)
  }

  getArticle(tenantId: string, idOrSlug: string): Promise<KbArticle | null> {
    return KbArticlesDrizzleHelper.getArticle(tenantId, idOrSlug)
  }

  createArticle(tenantId: string, article: KbArticle): Promise<KbArticle> {
    return KbArticlesDrizzleHelper.createArticle(tenantId, article)
  }

  voteArticle(tenantId: string, articleId: string, isHelpful: boolean): Promise<KbArticle | null> {
    return KbArticlesDrizzleHelper.voteArticle(tenantId, articleId, isHelpful)
  }

  getPortalOverview(tenantId: string, contactId: string): Promise<CustomerPortalOverview> {
    return KbPortalDrizzleHelper.getPortalOverview(tenantId, contactId)
  }
}
