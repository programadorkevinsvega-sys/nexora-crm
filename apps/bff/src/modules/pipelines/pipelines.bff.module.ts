import { Module } from '@nestjs/common'
import { PipelinesBffController } from './pipelines.bff.controller'
import { PipelinesBffService } from './pipelines.bff.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [PipelinesBffController],
  providers: [PipelinesBffService, CacheService],
  exports: [PipelinesBffService],
})
export class PipelinesBffModule {}
