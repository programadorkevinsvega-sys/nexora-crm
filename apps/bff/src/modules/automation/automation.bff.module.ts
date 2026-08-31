import { Module } from '@nestjs/common'
import { AutomationBffController } from './automation.bff.controller'
import { AutomationBffService } from './automation.bff.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [AutomationBffController],
  providers: [AutomationBffService, CacheService],
  exports: [AutomationBffService],
})
export class AutomationBffModule {}
