import { Module } from '@nestjs/common'
import { Customer360BffController } from './customer-360.bff.controller'
import { Customer360BffService } from './customer-360.bff.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [Customer360BffController],
  providers: [Customer360BffService, CacheService],
  exports: [Customer360BffService],
})
export class Customer360BffModule {}
