import { Module } from '@nestjs/common'
import { KnowledgeBaseController } from './knowledge-base.controller'
import { KnowledgeBaseGrpcController } from '../grpc/knowledge-base-grpc.controller'
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
import { KnowledgeBaseRepository } from '../../domain/repositories/knowledge-base.repository'
import { DrizzleKnowledgeBaseRepository } from '../../infrastructure/drizzle-knowledge-base.repository'

@Module({
  controllers: [KnowledgeBaseController, KnowledgeBaseGrpcController],
  providers: [
    CreateCategoryHandler,
    CreateArticleHandler,
    VoteArticleHandler,
    ListCategoriesHandler,
    ListArticlesHandler,
    GetArticleHandler,
    GetPortalOverviewHandler,
    {
      provide: KnowledgeBaseRepository,
      useClass: DrizzleKnowledgeBaseRepository,
    },
  ],
  exports: [
    KnowledgeBaseRepository,
    CreateCategoryHandler,
    CreateArticleHandler,
    VoteArticleHandler,
    ListCategoriesHandler,
    ListArticlesHandler,
    GetArticleHandler,
    GetPortalOverviewHandler,
  ],
})
export class KnowledgeBaseModule {}
