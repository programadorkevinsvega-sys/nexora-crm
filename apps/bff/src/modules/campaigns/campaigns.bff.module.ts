import { Module } from '@nestjs/common'
import { CampaignsBffController } from './campaigns.bff.controller'
import { MassEmailBffController } from './mass-email.bff.controller'
import { CampaignsBffService } from './campaigns.bff.service'
import { MassEmailService } from './mass-email.service'
import { CacheService } from '../../common/cache/cache.service'
import { IntegrationsBffModule } from '../integrations/integrations.bff.module'

@Module({
  imports: [IntegrationsBffModule],
  controllers: [CampaignsBffController, MassEmailBffController],
  providers: [CampaignsBffService, MassEmailService, CacheService],
  exports: [CampaignsBffService, MassEmailService],
})
export class CampaignsBffModule {}
