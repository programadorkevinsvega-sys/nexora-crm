import { Injectable, NotFoundException } from '@nestjs/common'
import {
  ListCategoriesQuery,
  ListArticlesQuery,
  GetArticleQuery,
  GetPortalOverviewQuery,
} from './kb.queries'
import { KnowledgeBaseRepository } from '../../domain/repositories/knowledge-base.repository'
import { KbCategory } from '../../domain/entities/kb-category.entity'
import { KbArticle } from '../../domain/entities/kb-article.entity'
import { CustomerPortalOverview } from '../../domain/entities/portal-overview.entity'

@Injectable()
export class ListCategoriesHandler {
  constructor(private readonly repo: KnowledgeBaseRepository) {}

  async execute(query: ListCategoriesQuery): Promise<KbCategory[]> {
    return this.repo.listCategories(query.tenantId)
  }
}

@Injectable()
export class ListArticlesHandler {
  constructor(private readonly repo: KnowledgeBaseRepository) {}

  async execute(query: ListArticlesQuery): Promise<KbArticle[]> {
    return this.repo.listArticles(query.tenantId, {
      categoryId: query.categoryId,
      query: query.query,
      publicOnly: query.publicOnly,
    })
  }
}

@Injectable()
export class GetArticleHandler {
  constructor(private readonly repo: KnowledgeBaseRepository) {}

  async execute(query: GetArticleQuery): Promise<KbArticle> {
    const article = await this.repo.getArticle(query.tenantId, query.idOrSlug)
    if (!article) {
      throw new NotFoundException(`Article '${query.idOrSlug}' not found`)
    }
    return article
  }
}

@Injectable()
export class GetPortalOverviewHandler {
  constructor(private readonly repo: KnowledgeBaseRepository) {}

  async execute(query: GetPortalOverviewQuery): Promise<CustomerPortalOverview> {
    return this.repo.getPortalOverview(query.tenantId, query.contactId)
  }
}
