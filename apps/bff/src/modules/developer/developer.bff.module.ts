import { Module } from '@nestjs/common'
import { DeveloperBffController } from './developer.bff.controller'
import { DeveloperBffService } from './developer.bff.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [DeveloperBffController],
  providers: [DeveloperBffService, CacheService],
  exports: [DeveloperBffService],
})
export class DeveloperBffModule {}
