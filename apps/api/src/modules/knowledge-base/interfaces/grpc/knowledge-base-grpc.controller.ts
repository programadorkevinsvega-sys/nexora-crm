import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateCategoryHandler,
  CreateArticleHandler,
  VoteArticleHandler,
} from '../../application/commands/kb.handlers'
import {
  ListCategoriesHandler,
  ListArticlesHandler,
  GetArticleHandler,
  GetPortalOverviewHandler,
} from '../../application/queries/kb.handlers'
import {
  CreateCategoryCommand,
  CreateArticleCommand,
  VoteArticleCommand,
} from '../../application/commands/kb.commands'
import {
  ListCategoriesQuery,
  ListArticlesQuery,
  GetArticleQuery,
  GetPortalOverviewQuery,
} from '../../application/queries/kb.queries'

@Controller()
export class KnowledgeBaseGrpcController {
  constructor(
    private readonly listCatsHandler: ListCategoriesHandler,
    private readonly createCatHandler: CreateCategoryHandler,
    private readonly listArtsHandler: ListArticlesHandler,
    private readonly getArtHandler: GetArticleHandler,
    private readonly createArtHandler: CreateArticleHandler,
    private readonly voteArtHandler: VoteArticleHandler,
    private readonly portalOverviewHandler: GetPortalOverviewHandler,
  ) {}

  @GrpcMethod('KnowledgeBaseService', 'ListCategories')
  async listCategories(data: { tenantId: string }) {
    const list = await this.listCatsHandler.execute(new ListCategoriesQuery(data.tenantId))
    return { jsonItems: list.map((c) => JSON.stringify(c)) }
  }

  @GrpcMethod('KnowledgeBaseService', 'CreateCategory')
  async createCategory(data: {
    tenantId: string
    name: string
    slug?: string
    description?: string
    icon?: string
    sortOrder?: number
    isPublic?: boolean
  }) {
    const cat = await this.createCatHandler.execute(
      new CreateCategoryCommand(
        data.tenantId,
        data.name,
        data.slug,
        data.description,
        data.icon,
        data.sortOrder,
        data.isPublic,
      ),
    )
    return { json: JSON.stringify(cat) }
  }

  @GrpcMethod('KnowledgeBaseService', 'ListArticles')
  async listArticles(data: {
    tenantId: string
    categoryId?: string
    query?: string
    publicOnly?: boolean
  }) {
    const list = await this.listArtsHandler.execute(
      new ListArticlesQuery(data.tenantId, data.categoryId, data.query, data.publicOnly),
    )
    return { jsonItems: list.map((a) => JSON.stringify(a)) }
  }

  @GrpcMethod('KnowledgeBaseService', 'GetArticle')
  async getArticle(data: { tenantId: string; idOrSlug: string }) {
    const art = await this.getArtHandler.execute(
      new GetArticleQuery(data.tenantId, data.idOrSlug),
    )
    return { json: JSON.stringify(art) }
  }

  @GrpcMethod('KnowledgeBaseService', 'CreateArticle')
  async createArticle(data: {
    tenantId: string
    title: string
    contentMarkdown: string
    categoryId?: string
    slug?: string
    summary?: string
    isPublished?: boolean
    tags?: string[]
    authorName?: string
  }) {
    const art = await this.createArtHandler.execute(
      new CreateArticleCommand(
        data.tenantId,
        data.title,
        data.contentMarkdown,
        data.categoryId,
        data.slug,
        data.summary,
        data.isPublished,
        data.tags,
        data.authorName,
      ),
    )
    return { json: JSON.stringify(art) }
  }

  @GrpcMethod('KnowledgeBaseService', 'VoteArticle')
  async voteArticle(data: { tenantId: string; articleId: string; isHelpful: boolean }) {
    const art = await this.voteArtHandler.execute(
      new VoteArticleCommand(data.tenantId, data.articleId, data.isHelpful),
    )
    return { json: JSON.stringify(art) }
  }

  @GrpcMethod('KnowledgeBaseService', 'GetPortalOverview')
  async getPortalOverview(data: { tenantId: string; contactId: string }) {
    const overview = await this.portalOverviewHandler.execute(
      new GetPortalOverviewQuery(data.tenantId, data.contactId),
    )
    return { json: JSON.stringify(overview) }
  }
}
