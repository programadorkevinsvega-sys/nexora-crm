import { Module } from '@nestjs/common'
import { InboxBffController } from './inbox.bff.controller'
import { InboxBffService } from './inbox.bff.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [InboxBffController],
  providers: [InboxBffService, CacheService],
  exports: [InboxBffService],
})
export class InboxBffModule {}
