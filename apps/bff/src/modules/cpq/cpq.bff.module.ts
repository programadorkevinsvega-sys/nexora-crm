import { Module } from '@nestjs/common'
import { CpqBffController } from './cpq.bff.controller'
import { CpqBffService } from './cpq.bff.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [CpqBffController],
  providers: [CpqBffService, CacheService],
  exports: [CpqBffService],
})
export class CpqBffModule {}
