import { Module } from '@nestjs/common'
import { WhatsappWebhookController } from './whatsapp-webhook.controller'
import { InboxBffModule } from '../inbox.bff.module'
import { CacheService } from '../../../common/cache/cache.service'

@Module({
  imports: [InboxBffModule],
  controllers: [WhatsappWebhookController],
  providers: [CacheService],
})
export class WhatsappWebhookModule {}
