import { Module } from '@nestjs/common'
import { AiBffController } from './ai.bff.controller'
import { AiBffService } from './ai.bff.service'
import { RagService } from './rag/rag.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [AiBffController],
  providers: [AiBffService, RagService, CacheService],
  exports: [AiBffService, RagService],
})
export class AiBffModule {}
