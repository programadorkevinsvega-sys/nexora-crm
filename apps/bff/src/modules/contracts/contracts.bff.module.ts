import { Module } from '@nestjs/common'
import { ContractsBffController } from './contracts.bff.controller'
import { ContractsBffService } from './contracts.bff.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [ContractsBffController],
  providers: [ContractsBffService, CacheService],
  exports: [ContractsBffService],
})
export class ContractsBffModule {}
