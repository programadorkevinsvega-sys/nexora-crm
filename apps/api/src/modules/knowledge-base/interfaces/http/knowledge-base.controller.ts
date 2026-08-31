import { Controller, Get, Post, Param, Query, Body, Headers, ParseUUIDPipe } from '@nestjs/common'
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

@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(
    private readonly listCatsHandler: ListCategoriesHandler,
    private readonly createCatHandler: CreateCategoryHandler,
    private readonly listArtsHandler: ListArticlesHandler,
    private readonly getArtHandler: GetArticleHandler,
    private readonly createArtHandler: CreateArticleHandler,
    private readonly voteArtHandler: VoteArticleHandler,
    private readonly portalOverviewHandler: GetPortalOverviewHandler,
  ) {}

  @Get('categories')
  async listCategories(@Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001') {
    return this.listCatsHandler.execute(new ListCategoriesQuery(tenantId))
  }

  @Post('categories')
  async createCategory(
    @Body() dto: { name: string; slug?: string; description?: string; icon?: string; sortOrder?: number; isPublic?: boolean },
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.createCatHandler.execute(
      new CreateCategoryCommand(tenantId, dto.name, dto.slug, dto.description, dto.icon, dto.sortOrder, dto.isPublic),
    )
  }

  @Get('articles')
  async listArticles(
    @Query('categoryId') categoryId?: string,
    @Query('query') query?: string,
    @Query('publicOnly') publicOnly?: string,
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.listArtsHandler.execute(
      new ListArticlesQuery(tenantId, categoryId, query, publicOnly !== 'false'),
    )
  }

  @Get('articles/:idOrSlug')
  async getArticle(
    @Param('idOrSlug') idOrSlug: string,
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.getArtHandler.execute(new GetArticleQuery(tenantId, idOrSlug))
  }

  @Post('articles')
  async createArticle(
    @Body() dto: { categoryId?: string; title: string; slug?: string; summary?: string; contentMarkdown: string; isPublished?: boolean; tags?: string[]; authorName?: string },
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.createArtHandler.execute(
      new CreateArticleCommand(tenantId, dto.title, dto.contentMarkdown, dto.categoryId, dto.slug, dto.summary, dto.isPublished, dto.tags, dto.authorName),
    )
  }

  @Post('articles/:id/vote')
  async voteArticle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { isHelpful: boolean },
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.voteArtHandler.execute(new VoteArticleCommand(tenantId, id, dto.isHelpful))
  }

  @Get('portal/overview/:contactId')
  async getPortalOverview(
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.portalOverviewHandler.execute(new GetPortalOverviewQuery(tenantId, contactId))
  }
}
