import { Module } from '@nestjs/common'
import { AiBffController } from './ai.bff.controller'
import { AiBffService } from './ai.bff.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [AiBffController],
  providers: [AiBffService, CacheService],
  exports: [AiBffService],
})
export class AiBffModule {}
