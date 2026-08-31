import { Controller, Get, Post, Param, Query, Body, Headers, ParseUUIDPipe } from '@nestjs/common'
import { KnowledgeBaseBffService } from './knowledge-base.bff.service'
import {
  CreateKnowledgeBaseCategorySchema,
  CreateKnowledgeBaseArticleSchema,
  VoteArticleSchema,
} from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import type {
  KnowledgeBaseCategory,
  CreateKnowledgeBaseCategory,
  KnowledgeBaseArticle,
  CreateKnowledgeBaseArticle,
  VoteArticle,
  CustomerPortalOverview,
} from '@crm/contracts'

@Controller('api/kb')
export class KnowledgeBaseBffController {
  constructor(private readonly service: KnowledgeBaseBffService) {}

  @Get('categories')
  async listCategories(@Headers('X-Tenant-Id') tenantId?: string): Promise<KnowledgeBaseCategory[]> {
    return this.service.listCategories(tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('categories')
  async createCategory(
    @Body(createZodPipe(CreateKnowledgeBaseCategorySchema)) dto: CreateKnowledgeBaseCategory,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<KnowledgeBaseCategory> {
    return this.service.createCategory(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('articles')
  async listArticles(
    @Query('categoryId') categoryId?: string,
    @Query('query') query?: string,
    @Query('publicOnly') publicOnly?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<KnowledgeBaseArticle[]> {
    return this.service.listArticles(
      { categoryId, query, publicOnly: publicOnly !== 'false' },
      tenantId || '00000000-0000-0000-0000-000000000001',
    )
  }

  @Get('articles/:idOrSlug')
  async getArticle(
    @Param('idOrSlug') idOrSlug: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<KnowledgeBaseArticle> {
    return this.service.getArticle(idOrSlug, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('articles')
  async createArticle(
    @Body(createZodPipe(CreateKnowledgeBaseArticleSchema)) dto: CreateKnowledgeBaseArticle,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<KnowledgeBaseArticle> {
    return this.service.createArticle(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('articles/:id/vote')
  async voteArticle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(VoteArticleSchema)) dto: VoteArticle,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<KnowledgeBaseArticle> {
    return this.service.voteArticle(id, dto.isHelpful, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('portal/overview/:contactId')
  async getPortalOverview(
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<CustomerPortalOverview> {
    return this.service.getPortalOverview(contactId, tenantId || '00000000-0000-0000-0000-000000000001')
  }
}
