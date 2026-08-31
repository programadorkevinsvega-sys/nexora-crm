import { Module } from '@nestjs/common'
import { CampaignsBffController } from './campaigns.bff.controller'
import { CampaignsBffService } from './campaigns.bff.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [CampaignsBffController],
  providers: [CampaignsBffService, CacheService],
  exports: [CampaignsBffService],
})
export class CampaignsBffModule {}
