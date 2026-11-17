import { Module } from '@nestjs/common'
import { TagsBffController } from './tags.bff.controller'
import { TagsBffService } from './tags.bff.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [TagsBffController],
  providers: [TagsBffService, CacheService],
  exports: [TagsBffService],
})
export class TagsBffModule {}
