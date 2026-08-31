import { Module } from '@nestjs/common'
import { KnowledgeBaseBffController } from './knowledge-base.bff.controller'
import { KnowledgeBaseBffService } from './knowledge-base.bff.service'
import { KbUploadController } from './kb-upload.controller'
import { KbUploadService } from './kb-upload.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [KnowledgeBaseBffController, KbUploadController],
  providers: [KnowledgeBaseBffService, KbUploadService, CacheService],
  exports: [KnowledgeBaseBffService],
})
export class KnowledgeBaseBffModule {}

