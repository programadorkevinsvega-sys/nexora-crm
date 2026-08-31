import { Module } from '@nestjs/common'
import { AnalyticsBffController } from './analytics.bff.controller'
import { AnalyticsBffService } from './analytics.bff.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [AnalyticsBffController],
  providers: [AnalyticsBffService, CacheService],
  exports: [AnalyticsBffService],
})
export class AnalyticsBffModule {}
