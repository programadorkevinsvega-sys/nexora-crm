import { Module } from '@nestjs/common'
import { SupportTicketsBffController } from './support-tickets.bff.controller'
import { SupportTicketsBffService } from './support-tickets.bff.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [SupportTicketsBffController],
  providers: [SupportTicketsBffService, CacheService],
  exports: [SupportTicketsBffService],
})
export class SupportTicketsBffModule {}
