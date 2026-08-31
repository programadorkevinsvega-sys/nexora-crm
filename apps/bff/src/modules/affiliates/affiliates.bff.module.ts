import { Module } from '@nestjs/common'
import { AffiliatesBffController } from './affiliates.bff.controller'
import { AffiliatesBffService } from './affiliates.bff.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [AffiliatesBffController],
  providers: [AffiliatesBffService, CacheService],
  exports: [AffiliatesBffService],
})
export class AffiliatesBffModule {}
