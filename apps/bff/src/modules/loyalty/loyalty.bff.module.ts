import { Module } from '@nestjs/common'
import { LoyaltyBffController } from './loyalty.bff.controller'
import { LoyaltyBffService } from './loyalty.bff.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [LoyaltyBffController],
  providers: [LoyaltyBffService, CacheService],
  exports: [LoyaltyBffService],
})
export class LoyaltyBffModule {}
