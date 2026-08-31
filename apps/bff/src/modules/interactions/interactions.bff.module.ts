import { Module } from '@nestjs/common'
import { InteractionsBffController } from './interactions.bff.controller'
import { InteractionsBffService } from './interactions.bff.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [InteractionsBffController],
  providers: [InteractionsBffService, CacheService],
  exports: [InteractionsBffService],
})
export class InteractionsBffModule {}
