import { Module } from '@nestjs/common'
import { KnowledgeBaseBffController } from './knowledge-base.bff.controller'
import { KnowledgeBaseBffService } from './knowledge-base.bff.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [KnowledgeBaseBffController],
  providers: [KnowledgeBaseBffService, CacheService],
  exports: [KnowledgeBaseBffService],
})
export class KnowledgeBaseBffModule {}
