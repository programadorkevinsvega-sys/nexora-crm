import { Module } from '@nestjs/common'
import { HelpdeskBffController } from './helpdesk.bff.controller'
import { HelpdeskBffService } from './helpdesk.bff.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [HelpdeskBffController],
  providers: [HelpdeskBffService, CacheService],
  exports: [HelpdeskBffService],
})
export class HelpdeskBffModule {}
