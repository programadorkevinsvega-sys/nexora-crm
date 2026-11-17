import { KbCategory } from '../entities/kb-category.entity'
import { KbArticle } from '../entities/kb-article.entity'
import { CustomerPortalOverview } from '../entities/portal-overview.entity'

export abstract class KnowledgeBaseRepository {
  abstract listCategories(tenantId: string): Promise<KbCategory[]>
  abstract createCategory(tenantId: string, category: KbCategory): Promise<KbCategory>
  abstract listArticles(
    tenantId: string,
    filters?: { categoryId?: string; query?: string; publicOnly?: boolean },
  ): Promise<KbArticle[]>
  abstract getArticle(tenantId: string, idOrSlug: string): Promise<KbArticle | null>
  abstract createArticle(tenantId: string, article: KbArticle): Promise<KbArticle>
  abstract voteArticle(tenantId: string, articleId: string, isHelpful: boolean): Promise<KbArticle | null>
  abstract getPortalOverview(tenantId: string, contactId: string): Promise<CustomerPortalOverview>
}
