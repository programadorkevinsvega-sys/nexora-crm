import { Module } from '@nestjs/common'
import { CompaniesBffController } from './companies.bff.controller'
import { CompaniesBffService } from './companies.bff.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [CompaniesBffController],
  providers: [CompaniesBffService, CacheService],
  exports: [CompaniesBffService],
})
export class CompaniesBffModule {}
