import { Controller, Get, Post, Param, Query, Body, Headers, ParseUUIDPipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger'
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

@ApiTags('Base de Conocimiento (Knowledge Base & RAG)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/kb')
export class KnowledgeBaseBffController {
  constructor(private readonly service: KnowledgeBaseBffService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Listar categorías de la base de conocimiento' })
  async listCategories(@Headers('X-Tenant-Id') tenantId?: string): Promise<KnowledgeBaseCategory[]> {
    return this.service.listCategories(tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('categories')
  @ApiOperation({ summary: 'Crear una nueva categoría de artículos' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'slug'],
      properties: {
        name: { type: 'string', example: 'Preguntas Frecuentes (FAQ)' },
        slug: { type: 'string', example: 'preguntas-frecuentes' },
        description: { type: 'string', example: 'Guías de uso rápido y resolución de dudas' },
      },
    },
  })
  async createCategory(
    @Body(createZodPipe(CreateKnowledgeBaseCategorySchema)) dto: CreateKnowledgeBaseCategory,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<KnowledgeBaseCategory> {
    return this.service.createCategory(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('articles')
  @ApiOperation({ summary: 'Listar artículos con búsqueda y filtro por categoría' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'UUID de la categoría' })
  @ApiQuery({ name: 'query', required: false, description: 'Texto de búsqueda en título y contenido' })
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
  @ApiOperation({ summary: 'Obtener un artículo por ID o Slug' })
  @ApiParam({ name: 'idOrSlug', description: 'UUID o slug URL del artículo' })
  async getArticle(
    @Param('idOrSlug') idOrSlug: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<KnowledgeBaseArticle> {
    return this.service.getArticle(idOrSlug, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('articles')
  @ApiOperation({ summary: 'Publicar un nuevo artículo en la base de conocimiento' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'contentMarkdown', 'categoryId'],
      properties: {
        title: { type: 'string', example: 'Cómo configurar la integración con WhatsApp Cloud API' },
        slug: { type: 'string', example: 'configurar-whatsapp-cloud-api' },
        contentMarkdown: { type: 'string', example: '# Guía de WhatsApp\nSigue estos pasos para obtener tu Token de Meta...' },
        categoryId: { type: 'string', example: '00000000-0000-0000-0000-000000000001' },
        isPublished: { type: 'boolean', example: true },
      },
    },
  })
  async createArticle(
    @Body(createZodPipe(CreateKnowledgeBaseArticleSchema)) dto: CreateKnowledgeBaseArticle,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<KnowledgeBaseArticle> {
    return this.service.createArticle(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('articles/:id/vote')
  @ApiOperation({ summary: 'Votar si un artículo fue útil o no' })
  @ApiParam({ name: 'id', description: 'UUID del artículo' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['isHelpful'],
      properties: {
        isHelpful: { type: 'boolean', example: true },
      },
    },
  })
  async voteArticle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(VoteArticleSchema)) dto: VoteArticle,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<KnowledgeBaseArticle> {
    return this.service.voteArticle(id, dto.isHelpful, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('portal/overview/:contactId')
  @ApiOperation({ summary: 'Obtener resumen del portal del cliente con tickets y cotizaciones' })
  @ApiParam({ name: 'contactId', description: 'UUID del contacto' })
  async getPortalOverview(
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<CustomerPortalOverview> {
    return this.service.getPortalOverview(contactId, tenantId || '00000000-0000-0000-0000-000000000001')
  }
}
